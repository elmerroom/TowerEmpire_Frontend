# PlayersCountControl

Виджет выбора лимита игроков и отображения текущего числа игроков. Соответствует методологии FSD.

## Публичный API

- `isHost: boolean` — режим хоста. При `true` отображается `select` с вариантами.
- `playersCount: number` — текущее число игроков.
- `maxPlayers: number` — выбранный лимит игроков.
- `options?: number[]` — список доступных значений (по умолчанию 3–12).
- `onChange: (value: number) => void` — обработчик смены лимита.
- `label?: string` — текст метки (по умолчанию `Игроки`).
- `className?: string` — дополнительные классы-обертки для контейнера.
- `classes?: { select?: string; option?: string; players?: string; playersNum?: string }` — классы для интеграции со стилями контейнера.

## Пример интеграции

```tsx
import { PlayersCountControl } from '@/widgets/players-count-control';

<PlayersCountControl
  isHost={isHost}
  playersCount={players.length}
  maxPlayers={maxPlayers}
  options={Array.from({ length: 12 - 3 + 1 }, (_, i) => i + 3)}
  onChange={value =>
    send({ command: 'change_max_players', max_players: value })
  }
  classes={{
    select: styles.formSelect,
    option: `${styles.titleWhite} ${styles.option} ${styles.playersNum}`,
    players: styles.players,
    playersNum: styles.playersNum,
  }}
/>;
```

Разметка `option` не содержит вложенных тегов, соответствует спецификации HTML.
