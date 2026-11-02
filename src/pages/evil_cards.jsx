import { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '../shared/ui/Button';
import { HeaderCard } from '../components/evil_cards/evil_header_card';
import { Players } from '../components/evil_cards/evil_players';
import { ModalExit } from '../components/helpers/modals/modal_exit';
import { ModalKick } from '../components/helpers/modals/modal_kick_warning';
import { ModalPromotion } from '../components/helpers/modals/modal_promotion';
import { ModalSettings } from '../components/helpers/modals/modal_settings';
import { ModalWithResult } from '../components/helpers/modals/modal_with_result/modal_with_result';
import { ModalWithWinnerCard } from '../components/helpers/modals/modal_with_winner_card/modal_with_winner_card';
import { ModalWaitingForPlayers } from '@/components/helpers/modals/modal_waiting_for_players/modal_waiting_for_players';
import { ModalPlayersRestored } from '@/components/helpers/modals/modal_players_restored';
import { useUser } from '../entities/user/model/hooks';
import { useChannel } from '../websocket/hooks/useChannel';
import { AudioSettings } from '../features/gameMusic/ui/AudioSettings';
import { useReconnectionCheck } from '../features/playerReconnection/index';
import { ProgressBar } from '../features/progressBar/progressBar';
import { useWarning } from '../features/warnings/hooks/useWarning';
// import { WorkerProvider } from '../store/contexts/WorkerProvider';
import { resetGame } from '../store/slices/game/gameSlice';
import { setGameMode } from '../store/modalSlice';
import { useWebSocket } from '../store/contexts/WsRootProvider';
import { safeExitFullscreen } from '../utils/safeExitFullscreen';
import { BoardWithCards } from '../widgets/boardWithCards/boardWithCards';

// Импортируем стили для страницы evil_cards
import '../css/pages/evil_cards.scss';
import { selectPhase } from '../entities/game/model/gameBjSlice';
import { Chat } from '@/features/chat/chat';

export const EvilCards = () => {
  useReconnectionCheck();
  useChannel('game:bj');
  const gamePhase = useSelector(selectPhase);
  const gamePage = useRef();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showFullscreenPrompt, setShowFullscreenPrompt] = useState(false);

  const { showWarning, clearWarning } = useWarning();
  const { isHost } = useUser();
  const { send } = useWebSocket();

  useLayoutEffect(() => {
    if (sessionStorage.getItem('gameFinished') === 'true') {
      const lobbyId = sessionStorage.getItem('finishedLobbyId');
      sessionStorage.removeItem('gameFinished');
      sessionStorage.removeItem('finishedLobbyId');
      navigate(lobbyId ? `/lobby/${lobbyId}` : '/');
      return;
    }
    // Показ стартовой модалки через WarningContext (вместо EvilModalStart)
    if (!sessionStorage.getItem('currentGameId')) {
      if (isHost()) {
        showWarning({
          title: '100 черных острот',
          text: 'Ты хост. Нажми «Начать игру», чтобы запустить раунд.',
          confirmText: 'Начать игру',
          onConfirm: async () => {
            await send({ command: 'start_game', game: 'Black Jokes' });
          },
        });
      } else {
        showWarning({
          title: '100 черных острот',
          text: 'Добро пожаловать! Ожидаем старта игры.',
        });
      }
    }
  }, []);

  const bjStatus = useSelector(state => state.gameBj?.status);
  const bjMountedRef = useRef(false);
  useEffect(() => {
    if (!bjMountedRef.current) {
      bjMountedRef.current = true;
      return;
    }
    if (bjStatus === 'running') {
      clearWarning();
    }
  }, [bjStatus, clearWarning]);

  function isMobileDevice() {
    const userAgent = navigator.userAgent.toLowerCase();
    return /mobile|iphone|ipad|ipod|android|blackberry|mini|palm/i.test(
      userAgent,
    );
  }

  function setFullscreenMobile() {
    if (isMobileDevice() && gamePage.current.requestFullscreen) {
      gamePage.current.requestFullscreen().catch(err => {
        console.warn('Fullscreen request failed', err);
      });
    }
  }

  useEffect(() => {
    dispatch(setGameMode('bj'));
    console.log('game mode');
    setFullscreenMobile();

    const handleFullscreenChange = () => {
      const isFullScreen =
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement;

      if (!isFullScreen && isMobileDevice()) {
        setShowFullscreenPrompt(true);
      } else {
        setShowFullscreenPrompt(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      dispatch(setGameMode(false));
      dispatch(resetGame());
      console.log('game mode off');
      safeExitFullscreen();

      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener(
        'webkitfullscreenchange',
        handleFullscreenChange,
      );
      document.removeEventListener(
        'mozfullscreenchange',
        handleFullscreenChange,
      );
      document.removeEventListener(
        'MSFullscreenChange',
        handleFullscreenChange,
      );
    };
  }, [dispatch]);

  const handleEnterFullscreen = () => {
    setFullscreenMobile();
  };

  return (
    <div
      ref={gamePage}
      className="d-flex align-items-center justify-content-center w-100 h-100 evil-cards-page"
    >
      {/* Контейнер для всех игровых модалок внутри fullscreen-элемента */}
      <div id="game-modal-root" />
      {/* <EvilModalStart /> */}
      <ModalWithResult gamePhase={gamePhase} />
      <ModalKick />
      <ModalExit />
      <ModalSettings />
      <ModalPromotion />
      <ModalWithWinnerCard />
      <ModalWaitingForPlayers />
      <ModalPlayersRestored />
      <div className="container_game">
        <HeaderCard />
        <BoardWithCards position="top" />
        {/* <WorkerProvider> */}
        <ProgressBar />
        {/* </WorkerProvider> */}
        <Players />
        <BoardWithCards position="bottom" />
        <AudioSettings />
        <Chat type="BLACK_JOKES" />
      </div>
      <div className="landscape">
        <svg style={{ width: '150px' }}>
          <use xlinkHref="#landscape"></use>
        </svg>
        <p>поверните экран для игры</p>
      </div>
      {showFullscreenPrompt && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1040,
            textAlign: 'center',
            padding: '1rem',
          }}
        >
          <p style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
            Для наилучшего опыта включите полноэкранный режим
          </p>
          <Button
            onClick={handleEnterFullscreen}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#ffb546',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '1rem',
              cursor: 'pointer',
            }}
          >
            Полный экран
          </Button>
        </div>
      )}
    </div>
  );
};
