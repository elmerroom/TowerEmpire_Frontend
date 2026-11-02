// Общие in-memory данные для моков и генерация ID лобби

export let users = [
  {
    id: 1,
    username: 'Host',
    email: 'host@example.com',
    avatar: null,
    nickname_color: '#4eb5b5',
    date_joined: new Date().toISOString(),
  },
  {
    id: 2,
    username: 'Player1',
    email: 'p1@example.com',
    avatar: null,
    nickname_color: '#f39c12',
    date_joined: new Date().toISOString(),
  },
];

let lobbySeq = 100;

export let lobbies = [
  {
    id: 1,
    title: 'Evil Cards Room',
    is_private: false,
    password: null,
    host: users[0],
    players: [users[0], users[1]],
    max_players: 12,
    game_name: 'evil_cards',
    started: false,
    game_settings: {
      settings: {
        victory_points: 5,
        player_round_second: 60,
        censorship: true,
        master_time: 30,
      },
    },
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    title: 'Fufl Playtest',
    is_private: false,
    password: null,
    host: users[0],
    players: [users[0]],
    max_players: 12,
    game_name: 'fufl',
    started: false,
    game_settings: {
      settings: {
        victory_points: 5,
        player_round_second: 60,
        censorship: true,
        master_time: 30,
      },
    },
    created_at: new Date().toISOString(),
  },
];

export function getNextLobbyId() {
  lobbySeq += 1;
  return lobbySeq;
}
