import { useEffect, useRef, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { CardsTopContainer } from '@/fuflomicin/shared/components/topContainer/CardsTopContainer';
import layoutStyles from '../GameLayout.module.scss';
import styles from './HireForFun.module.scss';
import { Timer } from '@/fuflomicin/shared/components/Timer/Timer';
import { useHFFCards } from '@/fuflomicin/hooks/useHFFCards';
import { CardsBottomContainer } from '@/fuflomicin/components/hff/bottomContainerHFF/CardsBottomContainer';
import { useChannel } from '@/websocket/hooks/useChannel';
import { useWebSocket } from '@/store/contexts/WsRootProvider';
import { useUser } from '@/entities/user/model/hooks';
import { useWarning } from '@/features/warnings/hooks/useWarning';
import { Title } from '@/fuflomicin/shared/components/titleContainer/title';
import { ProgressBar } from '@/fuflomicin/shared/components/ProgressBar';
import { PlayersContainer } from '@/fuflomicin/shared/components/PlayersContainer';
import { Status } from '@/fuflomicin/shared/components/Status/Status';
import { descriptionHireForFun } from '@/features/game-description/const/descriptionHireForFun';
import { ModalKick } from '@/components/helpers/modals/modal_kick_warning';
import { ModalExit } from '@/components/helpers/modals/modal_exit';
import { ModalSettings } from '@/components/helpers/modals/modal_settings';
import { ModalPromotion } from '@/components/helpers/modals/modal_promotion';
import { ModalWithResult } from '@/components/helpers/modals/modal_with_result/modal_with_result';
import { ModalWaitingForPlayers } from '@/components/helpers/modals/modal_waiting_for_players/modal_waiting_for_players';
import { ModalPlayersRestored } from '@/components/helpers/modals/modal_players_restored';
import { ModalWithWinnerCard } from '@/fuflomicin/modals/modal_with_winner_card/modal_with_winner_card';
import { setGameMode } from '@/store/modalSlice';
import {
  resetGame,
  getGamePhase,
  getGameId,
} from '@/store/fuflomicin/fuflSlice';
import { Chat } from '@/features/chat/chat';
import { ChatHffIcon } from '@/shared/ui/icons/ChatHffIcon';

export const HireForFun = () => {
  useChannel('game:hff');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const gamePhase = useSelector(getGamePhase);
  const hffGameId = useSelector(getGameId);
  const { showWarning, clearWarning } = useWarning();
  const { isHost } = useUser();
  const { send } = useWebSocket();
  const { allChosenCards, isFlippedPhase, selectedCardId, handleSelectCard } =
    useHFFCards();

  useLayoutEffect(() => {
    if (sessionStorage.getItem('gameFinished') === 'true') {
      const lobbyId = sessionStorage.getItem('finishedLobbyId');
      sessionStorage.removeItem('gameFinished');
      sessionStorage.removeItem('finishedLobbyId');
      navigate(lobbyId ? `/lobby/${lobbyId}` : '/');
      return;
    }
    if (!sessionStorage.getItem('currentGameId')) {
      if (isHost()) {
        showWarning({
          title: 'Наймъ по Фану',
          text: 'Ты хост. Нажми «Начать игру», чтобы запустить раунд.',
          confirmText: 'Начать игру',
          onConfirm: async () => {
            await send({ command: 'start_game', game: 'Trade for hire' });
          },
        });
      } else {
        showWarning({
          title: 'Наймъ по Фану',
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
    if (hffGameId !== null) {
      clearWarning();
    }
  }, [hffGameId, clearWarning]);

  useEffect(() => {
    dispatch(setGameMode('hff'));
    return () => {
      dispatch(setGameMode(false));
      dispatch(resetGame());
      sessionStorage.removeItem('currentGameId');
      sessionStorage.removeItem('currentGameType');
    };
  }, [dispatch]);

  return (
    <div className={layoutStyles.wrapper}>
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
          <Title gameName="НАЙМЪ ПО ФАНУ" leaderNameColor="#FFD497" />
          <div className={layoutStyles.playersContainer}>
            <Status variant="hff" />
            <PlayersContainer gameDescription={descriptionHireForFun} />
          </div>
        </div>
        <div className={layoutStyles.rightContainer}>
          <div className={layoutStyles.cardsTopContainer}>
            <CardsTopContainer
              imagePath={'hff'}
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
          <CardsBottomContainer
            handleSelectCard={handleSelectCard}
            chatSlot={
              <Chat type="HIRE_FOR_FUN" icon={<ChatHffIcon />} iconSrc="" />
            }
          />
        </div>
      </div>
    </div>
  );
};
