import type { AppDispatch, RootState } from '@/store/store';
import { setWordsCurrentPlayer } from './fuflSlice';
import { getUserId } from '@/entities/user/model/slice';

export const updatePlayerHandFromRound =
  (players: any[]) => (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const userId = getUserId(state);

    if (!userId || !Array.isArray(players)) return;

    const myPlayer = players.find(
      (p: any) => Number(p.user_id) === Number(userId),
    );

    if (!myPlayer) return;

    if (
      Array.isArray(myPlayer.selected_cards_fm) &&
      myPlayer.selected_cards_fm.length > 0
    ) {
      const normalizedCards = myPlayer.selected_cards_fm.map((item: any) => ({
        ...item.card,
        id: item.id,
        cardId: item.card?.id,
        selectedIndex: item.order ?? 0,
        field: 'WORDS',
        type: 'WORD',
        variants: [
          item.card.noun,
          item.card.masculine_adjective,
          item.card.feminine_adjective,
          item.card.average_adjective,
        ].filter(Boolean),
      }));
      dispatch(setWordsCurrentPlayer(normalizedCards));
      return;
    }

    // TM (HireForFun): selected_cards_tm — каждая карточка имеет только поле name
    if (
      Array.isArray(myPlayer.selected_cards_tm) &&
      myPlayer.selected_cards_tm.length > 0
    ) {
      const normalizedCards = myPlayer.selected_cards_tm.map((item: any) => ({
        ...item.card,
        id: item.id,
        cardId: item.card?.id,
        selectedIndex: item.order ?? 0,
        field: 'WORDS',
        type: 'WORD',
        variants: [item.card?.name].filter(Boolean),
      }));
      dispatch(setWordsCurrentPlayer(normalizedCards));
    }
  };
