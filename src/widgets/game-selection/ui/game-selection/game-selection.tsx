import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useWebSocket } from '@/store/contexts/WsRootProvider';
import { ModalGameDescription } from '@/features/game-description/index';
import { descriptionFuflomicin } from '@/features/game-description/const/descriptionFuflomicin';
import { descriptionHireForFun } from '@/features/game-description/const/descriptionHireForFun';
import { openModal } from '@/store/modalSlice';
import { getUserId } from '@/entities/user/model/slice';
import { selectAllLobbyPlayers } from '@/entities/player/model/lobbyPlayerSlice';
import { selectIsHostFromCurrent } from '@/store/slices/lobby/currentLobbySlice';
import { GameSelectCard } from '@/entities/game';

import styles from './game-selection.module.scss';
import { Button } from '@/shared/ui/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';

interface GameConfig {
  id: string;
  title: string;
  description: string;
  image: string;
  rulesDescription: any;
}

const GAMES: GameConfig[] = [
  {
    id: 'Black_Jokes',
    title: '100 черных острот',
    description: 'Смешная карточная игра',
    image: '/img/game-card/100_black_jokes.svg',
    rulesDescription: null,
  },
  {
    id: 'fuflomicin',
    title: 'Фуфломицин',
    description: 'Смешная карточная игра',
    image: '/img/game-card/Fuflomicin.svg',
    rulesDescription: descriptionFuflomicin,
  },
  {
    id: 'Trade for hire',
    title: 'Наймъ по фану',
    description: 'Смешная карточная игра',
    image: '/img/game-card/hire_for_fun.svg',
    rulesDescription: descriptionHireForFun,
  },
];

interface GameSelectionProps {
  className?: string;
}

/**
 * GameSelection Widget
 * Handles game selection and starting the game in the lobby.
 * Widgets layer (FSD)
 */
export const GameSelection: React.FC<GameSelectionProps> = ({
  className = '',
}) => {
  const isHost = useSelector(selectIsHostFromCurrent);
  const lobbyPlayers = useSelector(selectAllLobbyPlayers);
  const userId = useSelector(getUserId);
  const dispatch = useDispatch();
  const { send } = useWebSocket();

  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [isDisabled, setIsDisabled] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [currentRulesDesc, setCurrentRulesDesc] = useState<any>(null);

  useEffect(() => {
    // 3 is the minimum number of players to start the game
    if (lobbyPlayers.length < 3) {
      setIsDisabled(true);
    } else {
      setIsDisabled(false);
    }
  }, [lobbyPlayers.length]);

  const handleOpenRules = (description: any) => {
    setCurrentRulesDesc(description);
    setShowRules(true);
  };

  const handleStartGame = async () => {
    if (!isHost) {
      alert('У вас нет прав хоста');
      return;
    }

    if (!selectedGameId) {
      alert('Пожалуйста, выберите игру');
      return;
    }

    const navigatePayload = {
      command: 'pre_start_game',
      user_id: userId,
      game_name: selectedGameId,
    };

    await send(navigatePayload);
  };

  return (
    <div className={`col ${styles.blockGame} ${className}`}>
      <ModalGameDescription
        isOpen={showRules}
        onClose={() => setShowRules(false)}
        description={currentRulesDesc}
      />

      <div className={styles.games}>
        {GAMES.map(game => (
          <GameSelectCard
            key={game.id}
            title={game.title}
            description={game.description}
            image={game.image}
            isSelected={selectedGameId === game.id}
            onClick={() => setSelectedGameId(game.id)}
            extraActions={
              <>
                <Button
                  className="btn-svg"
                  onClick={e => {
                    e.stopPropagation();
                    handleOpenRules(game.rulesDescription);
                  }}
                >
                  <FontAwesomeIcon
                    icon={faCircleInfo}
                    style={{ height: '18px', width: '18px' }}
                  />
                </Button>
                {isHost && (
                  <Button
                    onClick={e => {
                      e.stopPropagation();
                      dispatch(openModal('GameSettings'));
                    }}
                    className="btn-svg ms-3 game__btn-settings"
                  >
                    <svg style={{ height: '20px', width: '20px' }}>
                      <use href="#settings"></use>
                    </svg>
                  </Button>
                )}
              </>
            }
          />
        ))}
      </div>

      <div className={styles.buttonsContainer}>
        <Button
          className={`${styles.btnSubmit} ${styles.btnSubmit__outline}`}
          onClick={() => dispatch(openModal('modalInvitePlayers'))}
        >
          Пригласить
        </Button>
        {isHost && (
          <Button
            className={`${styles.btnSubmit} ${styles.btnSubmit__play}`}
            disabled={isDisabled || !selectedGameId}
            onClick={handleStartGame}
          >
            Играть
          </Button>
        )}
      </div>
    </div>
  );
};
