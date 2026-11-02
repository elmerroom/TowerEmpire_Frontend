import { http, HttpResponse } from 'msw';
import { lobbies } from '../data';
import { match, findUserById } from '../utils';

export const fuflHandlers = [
  // Начало игры Fufl
  http.post(match('fufl/start_game/'), async ({ request }) => {
    const body = await request.json().catch(() => ({}));
    const gameId = body?.game_id;
    const lobby = lobbies.find(l => l.id === Number(gameId));

    if (!lobby) {
      return HttpResponse.json({ detail: 'Game not found' }, { status: 404 });
    }

    lobby.started = true;

    return HttpResponse.json({
      success: true,
      game_id: gameId,
      game_status: 'resume',

      game_phase: 'playing',
      current_round: {
        id: 1,
        roundNumber: 1,
        text: 'Вопрос для первого раунда Fufl',
      },
      settings: lobby.game_settings.settings,
    });
  }),

  // Получение состояния игры Fufl
  http.get(match('fufl/game_state/:id'), async ({ params }) => {
    const lobby = lobbies.find(l => l.id === Number(params.id));

    if (!lobby) {
      return HttpResponse.json({ detail: 'Game not found' }, { status: 404 });
    }

    return HttpResponse.json({
      game_id: Number(params.id),
      game_status: lobby.started ? 'resume' : 'pause',
      game_phase: lobby.started ? 'playing' : 'waiting',
      current_round: {
        id: 1,
        roundNumber: 1,
        text: 'Вопрос для первого раунда Fufl',
      },
      players: Object.fromEntries(
        lobby.players.map(p => [
          p.id,
          {
            id: p.id,
            username: p.username,
            score: 0,
            isMaster: p.id === lobby.host.id,
            isOnline: true,
            cards: Array.from({ length: 5 }, (_, i) => ({
              id: `player_${p.id}_card_${i}`,
              text: `Карта игрока ${p.username} #${i + 1}`,
              isChosen: false,
            })),
          },
        ]),
      ),
      settings: lobby.game_settings.settings,
    });
  }),

  // Выбор карты игроком в Fufl
  http.post(match('fufl/select_card/'), async ({ request }) => {
    const body = await request.json().catch(() => ({}));
    const { card_id, game_id, user_id } = body;

    return HttpResponse.json({
      success: true,
      card_id,
      user_id,
    });
  }),

  // Выбор победителя ведущим в Fufl
  http.post(match('fufl/select_winner/'), async ({ request }) => {
    const body = await request.json().catch(() => ({}));
    const { card_id, game_id } = body;

    return HttpResponse.json({
      success: true,
      card_id,
      winner_id: 2,
      round_finished: true,
    });
  }),

  // Пауза/продолжение игры Fufl
  http.post(match('fufl/toggle_pause/'), async ({ request }) => {
    const body = await request.json().catch(() => ({}));
    const { game_id, pause } = body;
    const lobby = lobbies.find(l => l.id === Number(game_id));

    if (!lobby) {
      return HttpResponse.json({ detail: 'Game not found' }, { status: 404 });
    }

    return HttpResponse.json({
      success: true,
      game_status: pause ? 'pause' : 'resume',
    });
  }),

  // Достижения игрока в Fufl
  http.get(match('users/:id/user_achievements_fufl/'), async ({ params }) => {
    const user = findUserById(params.id);
    if (!user) {
      return HttpResponse.json(
        { code: 'user_not_found', detail: 'Пользователь не найден' },
        { status: 401 },
      );
    }

    return HttpResponse.json([
      {
        id: 1,
        title: 'Первая игра в Fufl',
        description: 'Сыграйте первую игру в Fufl',
      },
      { id: 2, title: 'Мастер Fufl', description: 'Выиграйте 5 игр в Fufl' },
    ]);
  }),

  // Получение новых карт для игрока в Fufl
  http.post(match('fufl/get_new_cards/'), async ({ request }) => {
    const body = await request.json().catch(() => ({}));
    const { game_id, user_id, count = 1 } = body;

    return HttpResponse.json({
      success: true,
      cards: Array.from({ length: count }, (_, i) => ({
        id: `new_card_${Date.now()}_${i}`,
        text: `Новая карта #${i + 1}`,
        isChosen: false,
      })),
    });
  }),

  // Завершение раунда в Fufl
  http.post(match('fufl/end_round/'), async ({ request }) => {
    const body = await request.json().catch(() => ({}));
    const { game_id } = body;

    return HttpResponse.json({
      success: true,
      next_round: {
        id: 2,
        roundNumber: 2,
        text: 'Вопрос для следующего раунда Fufl',
      },
    });
  }),

  // Завершение игры Fufl
  http.post(match('fufl/end_game/'), async ({ request }) => {
    const body = await request.json().catch(() => ({}));
    const { game_id } = body;
    const lobby = lobbies.find(l => l.id === Number(game_id));

    if (lobby) {
      lobby.started = false;
    }

    return HttpResponse.json({
      success: true,
      winners: [{ id: 2, username: 'Player1', score: 5 }],
      game_phase: 'finish_game',
    });
  }),
];
