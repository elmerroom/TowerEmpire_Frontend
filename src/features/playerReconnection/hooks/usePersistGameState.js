// Сохраняем состояние игры при изменении
import { useEffect } from 'react';
import { useSelector } from 'react-redux';

export const usePersistGameState = () => {
  const game = useSelector(state => state.game);

  useEffect(() => {
    try {
      sessionStorage.setItem('savedGameState', JSON.stringify(game));
    } catch (e) {
      console.warn('Не удалось сохранить состояние игры в sessionStorage', e);
    }
  }, [game]);
};
