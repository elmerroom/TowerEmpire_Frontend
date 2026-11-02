import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useLazyGetPlayersInGameQuery } from '../../playerReconnection/api/gamePlayersApi';
import { setGameId } from '../../../store/slices/game/gameSlice';
import { useWarning } from '../../warnings/index';
import { useWebSocket } from '../../../store/contexts/WsRootProvider';

// РҐСѓРє РґР»СЏ РІРѕСЃСЃС‚Р°РЅРѕРІР»РµРЅРёСЏ РёРіСЂРѕРєР° РїРѕСЃР»Рµ F5
export const useReconnectionCheck = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showWarning } = useWarning();
  const { send, isOnline } = useWebSocket();
  const userId = useSelector(state => state.user.user_id);
  const [triggerGetPlayers] = useLazyGetPlayersInGameQuery();

  useEffect(() => {
    const reconnect = async () => {
      // РџСЂРѕРІРµСЂСЏРµРј, Р±С‹Р» Р»Рё reload
      const navType = performance.getEntriesByType('navigation')[0]?.type;
      if (navType !== 'reload') return;
      const storedGameId = sessionStorage.getItem('currentGameId');
      if (!storedGameId) return;
      if (!isOnline) return;
      // РЎСЂР°Р·Сѓ С€Р»С‘Рј reconnect
      await send({ command: 'player_reconnection', game: 'Black Jokes' });

      triggerGetPlayers(storedGameId)
        .unwrap()
        .then(players => {
          const found = players.some(p => p.user_id === parseInt(userId));
          console.table(players);
          if (!found) {
            sessionStorage.removeItem('currentGameId');
            showWarning({
              title: 'РЈРїСЃ...',
              text: 'РРіСЂРѕРє РЅРµ РЅР°Р№РґРµРЅ РІ Р°РєС‚РёРІРЅРѕР№ РёРіСЂРµ',
              redirectPath: '/',
            });
          } else {
            // Р’РѕСЃСЃС‚Р°РЅР°РІР»РёРІР°РµРј id РёРіСЂС‹
            dispatch(setGameId(Number(storedGameId)));
            showWarning({
              title: 'РЈРїСЃ...',
              text: 'РќРµРѕР±С…РѕРґРёРјРѕ РґРѕР¶РґР°С‚СЊСЃСЏ СЃР»РµРґСѓСЋС‰РµРіРѕ СЂР°СѓРЅРґР°',
              theme: 'game',
            });
          }
        })
        .catch(() => {
          sessionStorage.removeItem('currentGameId');
        });
    };
    reconnect();
  }, [
    dispatch,
    navigate,
    triggerGetPlayers,
    userId,
    showWarning,
    send,
    isOnline,
  ]);
};
