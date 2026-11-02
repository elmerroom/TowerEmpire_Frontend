import { updateSettings } from '../../features/gameSettings/model/gameSettingsSlice';
import { setCurrentLobby } from '../currentLobbySlice';
import { setAll as setAllPlayers } from '../playersSlice';

/**
 * Thunk для обновления gameSettings в redux при setCurrentLobby
 * @param {object} payload - данные лобби, включая game_settings
 */
export const setCurrentLobbyAndGameSettings = payload => dispatch => {
  dispatch(
    setAllPlayers(Array.isArray(payload?.players) ? payload.players : []),
  );
  dispatch(setCurrentLobby(payload));
  if (payload.game_settings) {
    const gameSettings = payload.game_settings?.settings;

    dispatch(
      updateSettings({
        scoreToWin: gameSettings.victory_points ?? gameSettings.score_to_win,
        roundTime: gameSettings.player_round_second ?? gameSettings.round_time,
        censorship: gameSettings.censorship,
        masterTime: gameSettings.masterTime ?? gameSettings.master_time,
      }),
    );
  }
};
