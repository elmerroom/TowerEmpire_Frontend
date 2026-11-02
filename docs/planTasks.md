# План: Глобальный обработчик ошибок авторизации

## Проблема

При входе через `login.jsx` пользователь не видит корректное сообщение об ошибке. Причина:

- Компонент читает `error.data?.error`, но RTK Query возвращает `{ status, message }`
- При 403 (email не подтверждён) пользователь видит `undefined` вместо понятного сообщения
- 8+ модальных окон имеют **разные** паттерны извлечения ошибок (DRY violation)
- Нет глобального state для auth ошибок в Redux
- Нет ErrorBoundary для критических auth ошибок

## Архитектурное решение

Создать единый слой обработки auth ошибок:

```
src/auth/errors/
├── types.ts                  # Типы auth ошибок (AuthErrorType, AuthErrorAction)
├── constants.ts              # Маппинг: HTTP status + backend message → клиентский формат
├── AuthErrorHandler.ts       # Класс с чистыми функциями для обработки ошибок
└── index.ts                  # Barrel export
```

## Задачи

### Phase 1: Foundation (типы + константы)

- [ ] **1.1** Создать `src/auth/errors/types.ts`
  - Определить `AuthErrorType` enum: `invalid_credentials`, `email_not_confirmed`, `user_not_found`, `session_expired`, `network_error`, `unknown`
  - Определить `AuthErrorAction` enum: `none`, `show_message`, `email_confirm`, `reauth`, `contact_support`
  - Определить интерфейс `AuthError { type, action, message, httpStatus?, originalError? }`

- [ ] **1.2** Создать `src/auth/errors/constants.ts`
  - Маппинг бэкенд ошибок → клиентские сообщения
  - Ключи: HTTP status + substring из `error.data.detail` / `error.message`
  - Включить все известные ошибки из `black_jokes/app/transports/handlers/users/exceptions.py`

### Phase 2: Обработчик

- [ ] **2.1** Создать `src/auth/errors/AuthErrorHandler.ts`
  - `static extractMessage(error: unknown): string` — извлекает сообщение из любого формата
  - `static classifyError(error: unknown): AuthErrorType` — определяет тип ошибки
  - `static getRequiredAction(error: unknown): AuthErrorAction` — определяет действие
  - `static buildAuthError(error: unknown): AuthError` — собирает полный объект
  - Покрыть unit-тестами (vitest)

### Phase 3: Redux state

- [ ] **3.1** Создать `src/store/slices/authErrorSlice.ts`
  - State: `{ error: AuthError | null, lastErrorTime: number | null }`
  - Actions: `setError(error)`, `clearError()`
  - Selectors: `selectAuthError`, `selectAuthErrorMessage`, `selectAuthErrorAction`
  - Интегрировать в root reducer

- [ ] **3.2** Интегрировать в `baseQueryWithReauth.ts`
  - При ошибках 4xx dispatch `authErrorSlice.setError()`
  - Не диспатчить при 401 (это handled refresh flow)
  - Не диспатчить при 5xx (это generic server error)

### Phase 4: UI компоненты

- [ ] **4.1** Обновить `login.jsx`
  - Заменить `setError(error.data?.error)` на `AuthErrorHandler.extractMessage(error)`
  - Добавить специфичную обработку 403 (email не подтверждён) с кнопкой «Отправить повторно»

- [ ] **4.2** Обновить `auth.jsx` (регистрация)
  - Использовать `AuthErrorHandler.extractMessage(error)`

- [ ] **4.3** Обновить `play_noauth.jsx`
  - Использовать `AuthErrorHandler.extractMessage(error)`

- [ ] **4.4** Обновить `create_room.jsx`
  - Использовать `AuthErrorHandler.extractMessage(error)`

- [ ] **4.5** Обновить `send_reset_password.jsx` + `set_new_password.jsx`
  - Использовать `AuthErrorHandler.extractMessage(error)`

### Phase 5: useAuth hook

- [ ] **5.1** Обновить `useAuth.jsx`
  - `signIn()`: пробрасывать `AuthError` вместо сырого error
  - `reAuth()`: возвращать `{ success: boolean, error?: AuthError }` вместо просто `false`
  - Dispatch `authErrorSlice` при критических ошибках

### Phase 6: Тесты + валидация

- [ ] **6.1** Unit-тесты для `AuthErrorHandler`
  - Тест на 403 с email_not_confirmed
  - Тест на 404 user_not_found
  - Тест на 422 invalid_password
  - Тест на network error
  - Тест на unknown error

- [ ] **6.2** Integration тест: login → 403 → правильное сообщение в UI

- [ ] **6.3** Проверить typecheck + lint + build

## Файлы для модификации

| Файл                                                  | Действие                      |
| ----------------------------------------------------- | ----------------------------- |
| `src/auth/errors/types.ts`                            | **Создать**                   |
| `src/auth/errors/constants.ts`                        | **Создать**                   |
| `src/auth/errors/AuthErrorHandler.ts`                 | **Создать**                   |
| `src/auth/errors/index.ts`                            | **Создать**                   |
| `src/store/slices/authErrorSlice.ts`                  | **Создать**                   |
| `src/store/slices/user/userSlice.jsx`                 | Импорт authErrorSlice         |
| `src/store/api/baseQueryWithReauth.ts`                | Dispatch authErrorSlice       |
| `src/components/helpers/hooks/useAuth.jsx`            | Использовать AuthErrorHandler |
| `src/components/lobby/modals/login.jsx`               | Использовать AuthErrorHandler |
| `src/components/lobby/modals/auth.jsx`                | Использовать AuthErrorHandler |
| `src/components/lobby/modals/play_noauth.jsx`         | Использовать AuthErrorHandler |
| `src/components/lobby/modals/create_room.jsx`         | Использовать AuthErrorHandler |
| `src/components/lobby/modals/send_reset_password.jsx` | Использовать AuthErrorHandler |
| `src/components/lobby/modals/set_new_password.jsx`    | Использовать AuthErrorHandler |

## Критерии готовности

- [ ] Все auth ошибки отображаются корректно (не `undefined`)
- [ ] При 403 показывается сообщение «Подтвердите email»
- [ ] Unit-тесты для AuthErrorHandler проходят
- [ ] `npm run typecheck` — без ошибок
- [ ] `npm run lint` — без ошибок
- [ ] `npm run build` — успешно
- [ ] Ручное тестирование login flow — ошибки видны

## Риски

- **Cyrillic encoding в baseQueryWithReauth.ts**: файлы могут содержать garbled UTF-8 символы — проверить перед модификацией
- **Breaking changes**: если другие части приложения зависят от текущего формата ошибок
- **Тестовое покрытие**: MSW моки для auth endpoints могут потребовать настройки
