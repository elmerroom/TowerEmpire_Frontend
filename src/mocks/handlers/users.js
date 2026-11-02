import { http, HttpResponse } from 'msw';
import { users, lobbies } from '../data';
import { match, currentUser, findUserById } from '../utils';

export const usersHandlers = [
  // Цвет никнейма
  http.get(match('users/update_nickname_color/'), async ({ request }) => {
    const user = currentUser(request);
    return HttpResponse.json({
      nickname_color: user.nickname_color || '#4eb5b5',
    });
  }),
  http.post(match('users/update_nickname_color/'), async ({ request }) => {
    const body = await request.json().catch(() => ({}));
    const color = body?.nickname_color || body?.color || '#4eb5b5';
    const user = currentUser(request);
    user.nickname_color = color;
    return HttpResponse.json({ ok: true, nickname_color: color });
  }),

  // Список игроков в игре
  http.get(match('users/:gameId/players/'), async ({ params }) => {
    const lobby = lobbies.find(l => l.id === Number(params.gameId));
    if (!lobby) {
      return HttpResponse.json(
        { detail: 'No Room matches the given query.' },
        { status: 404 },
      );
    }
    return HttpResponse.json(lobby.players);
  }),

  // Статистика игрока
  http.get(match('users/:id/player_statistic/'), async ({ params }) => {
    const user = findUserById(params.id);
    if (!user) {
      return HttpResponse.json(
        { code: 'user_not_found', detail: 'Пользователь не найден' },
        { status: 401 },
      );
    }
    return HttpResponse.json([
      { game: 'evil_cards', total_games: 12, won_games: 4 },
      { game: 'fufl', total_games: 3, won_games: 1 },
    ]);
  }),

  // Достижения игрока (Black Jokes)
  http.get(
    match('users/:id/user_achievements_black_jokes/'),
    async ({ params }) => {
      const user = findUserById(params.id);
      if (!user) {
        return HttpResponse.json(
          { code: 'user_not_found', detail: 'Пользователь не найден' },
          { status: 401 },
        );
      }
      return HttpResponse.json([
        { id: 1, title: 'Первый заход', description: 'Сыграйте первую игру' },
        {
          id: 2,
          title: 'Пауза — не стоп',
          description: 'Вернитесь после паузы',
        },
      ]);
    },
  ),

  // Обновить профиль пользователя
  http.patch(match('users/:id/update/'), async ({ params, request }) => {
    const user = findUserById(params.id);
    if (!user) {
      return HttpResponse.json(
        { code: 'user_not_found', detail: 'Пользователь не найден' },
        { status: 401 },
      );
    }
    const body = await request.json().catch(() => ({}));
    if (typeof body.username === 'string') user.username = body.username;
    if (typeof body.email === 'string') user.email = body.email;
    if (typeof body.avatar === 'string') user.avatar = body.avatar;

    return HttpResponse.json({
      data: { username: user.username, email: user.email, avatar: user.avatar },
    });
  }),

  // Удалить аккаунт
  http.delete(match('users/:id/delete'), async ({ params }) => {
    const idx = users.findIndex(u => u.id === Number(params.id));
    if (idx === -1) {
      return HttpResponse.json(
        { code: 'user_not_found', detail: 'Пользователь не найден' },
        { status: 404 },
      );
    }
    users.splice(idx, 1);
    lobbies.forEach(l => {
      l.players = l.players.filter(p => p.id !== Number(params.id));
      if (l.host?.id === Number(params.id)) {
        l.host = l.players[0] || null;
      }
    });
    return HttpResponse.json({ ok: true });
  }),

  // Email-код и восстановление пароля (заглушки)
  http.post(match('users/generate_code/'), async () => {
    return HttpResponse.json({ ok: true });
  }),
  http.post(match('users/access_email/'), async () => {
    return HttpResponse.json({ ok: true });
  }),
  http.post(match('users/recovery_password/'), async () => {
    return HttpResponse.json({ ok: true });
  }),
];
