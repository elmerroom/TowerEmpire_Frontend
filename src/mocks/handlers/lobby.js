import { http, HttpResponse } from 'msw';
import { lobbies, getNextLobbyId } from '../data';
import { match, currentUser, normalizeSettings } from '../utils';

// Лобби: листинг, создание, получение, вход
export const lobbyHandlers = [
  // Список лобби
  http.get(match('base/lobby/'), async () => {
    const list = lobbies.map(({ password, ...rest }) => rest);
    return HttpResponse.json(list);
  }),

  // Создать лобби
  http.post(match('base/lobby/'), async ({ request }) => {
    const body = await request.json().catch(() => ({}));
    const host = currentUser(request);
    const settings = normalizeSettings(
      body?.game_settings || body?.settings || body,
    );

    const newId = getNextLobbyId();
    const newLobby = {
      id: newId,
      title: body?.title || 'New Lobby',
      is_private: !!body?.is_private,
      password: body?.password || null,
      host,
      players: [host],
      max_players: body?.max_players ?? 12,
      game_name: body?.game_name || 'fufl',
      started: false,
      game_settings: settings,
      created_at: new Date().toISOString(),
    };
    lobbies.push(newLobby);
    return HttpResponse.json(newLobby, { status: 201 });
  }),

  // Получить лобби
  http.get(match('base/lobby/:id'), async ({ params }) => {
    const lobby = lobbies.find(l => l.id === Number(params.id));
    if (!lobby) {
      return HttpResponse.json(
        { detail: 'No Room matches the given query.' },
        { status: 404 },
      );
    }
    const { password, ...rest } = lobby;
    return HttpResponse.json(rest);
  }),

  // Войти в лобби
  http.patch(match('base/lobby/:id/'), async ({ params, request }) => {
    const lobby = lobbies.find(l => l.id === Number(params.id));
    if (!lobby) {
      return HttpResponse.json(
        { detail: 'No Room matches the given query.' },
        { status: 404 },
      );
    }
    const user = currentUser(request);
    const body = await request.json().catch(() => ({}));

    if (lobby.is_private) {
      const provided = body?.password || '';
      if (!provided || provided !== lobby.password) {
        return HttpResponse.json(
          { password: ['Неверный пароль'] },
          { status: 400 },
        );
      }
    }

    const alreadyIn = lobby.players.some(p => p.id === user.id);
    if (!alreadyIn) {
      lobby.players.push(user);
    }
    const { password, ...rest } = lobby;
    return HttpResponse.json(rest);
  }),
];
