import { useEffect, useRef, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import layoutStyles from '../GameLayout.module.scss';
import styles from './Fufl.module.scss';
import { BottomContainer } from '../../components/fufl/bottomContainerFM/bottomContainer';
import { ProgressBar } from '../../shared/components/ProgressBar/ProgressBar';
import { Title } from '../../shared/components/titleContainer/title';
import { useChannel } from '@/websocket/hooks/useChannel';
import { useWebSocket } from '@/store/contexts/WsRootProvider';
import { useUser } from '../../../entities/user/model/hooks';
import { useWarning } from '@/features/warnings/hooks/useWarning';
import { setGameMode } from '@/store/modalSlice';
import {
  resetGame,
  getGamePhase,
  getGameId,
} from '@/store/fuflomicin/fuflSlice';
import { ModalExit } from '@/components/helpers/modals/modal_exit';
import { ModalKick } from '@/components/helpers/modals/modal_kick_warning';
import { ModalPromotion } from '@/components/helpers/modals/modal_promotion';
import { ModalSettings } from '@/components/helpers/modals/modal_settings';
import { ModalWaitingForPlayers } from '@/components/helpers/modals/modal_waiting_for_players/modal_waiting_for_players';
import { ModalPlayersRestored } from '@/components/helpers/modals/modal_players_restored';
import { CardsTopContainer } from '../../shared/components/topContainer/CardsTopContainer';
import { PlayersContainer } from '../../shared/components/PlayersContainer';
import { Timer } from '../../shared/components/Timer/Timer';
import { ModalWithResult } from '@/components/helpers/modals/modal_with_result/modal_with_result';
import { ModalWithWinnerCard } from '../../modals/modal_with_winner_card/modal_with_winner_card';
import { Status } from '../../shared/components/Status/Status';
import { useFMCards } from '@/fuflomicin/hooks/useFMCards';

export const Fufl = () => {
  // Активируем WS каналы:
  // - game:fm включает и общие игровые события, и FM-специфичные (start_round с adjective+noun)
  useChannel('game:fm');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const gamePhase = useSelector(getGamePhase);
  const fmGameId = useSelector(getGameId);
  const { showWarning, clearWarning } = useWarning();
  const { isHost } = useUser();
  const { send } = useWebSocket();
  const { allChosenCards, isFlippedPhase, selectedCardId, handleSelectCard } =
    useFMCards();

  useLayoutEffect(() => {
    if (sessionStorage.getItem('gameFinished') === 'true') {
      const lobbyId = sessionStorage.getItem('finishedLobbyId');
      sessionStorage.removeItem('gameFinished');
      sessionStorage.removeItem('finishedLobbyId');
      navigate(lobbyId ? `/lobby/${lobbyId}` : '/');
      return;
    }
    // Показ стартовой модалки через WarningContext (аналогично EvilCards)
    // ТОЛЬКО если игра ещё не началась (нет currentGameId в sessionStorage)
    if (!sessionStorage.getItem('currentGameId')) {
      if (isHost()) {
        showWarning({
          title: 'Фуфломицин',
          text: 'Ты хост. Нажми «Начать игру», чтобы запустить раунд.',
          confirmText: 'Начать игру',
          onConfirm: async () => {
            await send({ command: 'start_game', game: 'Fuflomycin' });
          },
        });
      } else {
        showWarning({
          title: 'Фуфломицин',
          text: 'Добро пожаловать! Ожидаем старта игры.',
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasMountedRef = useRef(false);
  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }
    if (fmGameId !== null) {
      clearWarning();
    }
  }, [fmGameId, clearWarning]);

  useEffect(() => {
    // Включаем режим игры для модалок
    dispatch(setGameMode('fuflomicin'));
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    console.log('game mode: Fuflomicin');

    return () => {
      dispatch(setGameMode(false));
      dispatch(resetGame());
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      console.log('game mode off: Fuflomicin');
    };
  }, [dispatch]);

  return (
    <div className={`${layoutStyles.wrapper} fuflomicin-page`}>
      {/* Контейнер для всех игровых модалок */}
      <div id="game-modal-root" />
      <ModalKick />
      <ModalExit />
      <ModalSettings gameType="fuflomicin" />
      <ModalPromotion />
      <ModalWithResult gamePhase={gamePhase} gameType="fuflomicin" />
      <ModalWithWinnerCard />
      <ModalWaitingForPlayers />
      <ModalPlayersRestored />
      <div className={`${layoutStyles.container} ${styles.gameContainer}`}>
        <div className={layoutStyles.leftContainer}>
          <Title />

          <div className={layoutStyles.playersContainer}>
            <Status />
            <PlayersContainer />
          </div>
        </div>
        <div className={layoutStyles.rightContainer}>
          <div className={layoutStyles.cardsTopContainer}>
            <CardsTopContainer
              imagePath={'fufl'}
              allChosenCards={allChosenCards}
              isFlippedPhase={isFlippedPhase}
              selectedCardId={selectedCardId}
              handleSelectCard={handleSelectCard}
            />
            <div className={layoutStyles.timerWrapper}>
              <Timer />
            </div>
          </div>
          <ProgressBar />
          <BottomContainer />
        </div>
      </div>
    </div>
  );
};
