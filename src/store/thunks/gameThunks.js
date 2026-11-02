import { startNewRound } from '../slices/game/gameSlice';
import { getRoundTime } from '../../features/gameSettings/model/gameSettingsSlice';

/**
 * Thunk action creator для старта нового раунда.
 * Получает актуальное время раунда из настроек и диспатчит startNewRound.
 * @param {object} roundData - Данные раунда из WS сообщения ({ id, roundNumber, text, cardType })
 */
export const dispatchStartNewRoundWithSettings =
  roundData => (dispatch, getState) => {
    const state = getState();
    // Получаем актуальное время раунда из gameSettingsSlice
    const currentRoundTimeSetting = getRoundTime(state);

    if (typeof currentRoundTimeSetting !== 'number') {
      // значение по умолчанию
      // currentRoundTimeSetting = 10; // Например
    }

    dispatch(
      startNewRound({
        ...roundData, // Данные из WebSocketProvider
        roundTimeSetting: currentRoundTimeSetting,
      }),
    );
  };
