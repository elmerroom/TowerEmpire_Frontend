import { useState, useEffect, useMemo, useCallback } from 'react';
import { BtnIcon } from '@/shared/ui/BtnIcon';
import { useSelector } from 'react-redux';

import {
  getRoundTime,
  getScoreToWin,
  getCensorship,
  getIsPrivate,
} from '../model/gameSettingsSlice';
import {
  validateRoundTime,
  validateRoundPoints,
  applyRoundTimeStep,
  getMinScoreToWin,
} from '../lib/validators';
import { useWebSocket } from '../../../store/contexts/WsRootProvider';
import { useLobbyPassword } from '../../../components/helpers/hooks/useLobbyPassword';
import { selectCurrentLobbyId } from '@/store/slices/lobby/currentLobbySlice';
import styles from './GameSettingsForm.module.scss';
import { Button } from '../../../shared/ui/Button';
import { selectAllGamePlayers } from '@/entities/player/model/gamePlayerSlice';
import { useToast } from '@/components/helpers/toast_notification';
import { InviteLink } from '@/features/invite-link-block/InviteLink';

interface LocalSettings {
  roundTime: string;
  scoreToWin: string;
  isPrivate: boolean;
  password: string;
  censorship: boolean;
}

interface GameSettingsFormProps {
  isHost: boolean;
  onSubmit: (settings: {
    scoreToWin: number;
    roundTime: number;
    censorship: boolean;
    isPrivate: boolean;
    password?: string;
    theme?: string;
  }) => void;
  theme?: 'game' | 'lobby' | 'fufl' | 'hff';
}

export const GameSettingsForm = ({
  isHost,
  onSubmit,
  theme = 'lobby',
}: GameSettingsFormProps) => {
  const { send } = useWebSocket();
  const { showToast } = useToast();
  // селекторы getGameSettings
  const roundTimeRedux = useSelector(getRoundTime);
  const scoreToWinRedux = useSelector(getScoreToWin);
  const censorshipRedux = useSelector(getCensorship);
  const isPrivateRedux = useSelector(getIsPrivate);

  const players = useSelector(selectAllGamePlayers);

  // мемо для минимального порога победных очков (зависит от players)
  const minScoreToWin = useMemo(() => getMinScoreToWin(players), [players]);

  const lobbyId = useSelector(selectCurrentLobbyId);
  const { get: getLobbyPassword, set: setLobbyPassword } = useLobbyPassword();

  // локальное состояние для формы — только то, что хост может менять
  const [localSettings, setLocalSettings] = useState<LocalSettings>({
    roundTime: roundTimeRedux.toString(),
    scoreToWin: scoreToWinRedux.toString(),
    isPrivate: isPrivateRedux || false,
    password: isHost && lobbyId ? getLobbyPassword(lobbyId) || '' : '',
    censorship: Boolean(censorshipRedux),
  });

  // Синхронизация с Redux при изменении настроек от сервера
  useEffect(() => {
    setLocalSettings(prev => ({
      ...prev,
      roundTime: roundTimeRedux.toString(),
      scoreToWin: scoreToWinRedux.toString(),
      censorship: Boolean(censorshipRedux),
    }));
  }, [roundTimeRedux, scoreToWinRedux, censorshipRedux]);

  // Если id лобби или isHost меняется — обновить пароль из sessionStorage
  useEffect(() => {
    if (isHost && lobbyId) {
      setLocalSettings(prev => ({
        ...prev,
        password: getLobbyPassword(lobbyId) || '',
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lobbyId, isHost]);

  // если в сторе изменилась приватность (пришло WS событие), синхронизируем отображение у не-хоста
  useEffect(() => {
    if (!isHost) {
      setLocalSettings(prev => ({
        ...prev,
        isPrivate: isPrivateRedux || false,
      }));
    }
  }, [isPrivateRedux, isHost]);

  // смена поля для хоста
  const handleChange = useCallback(
    (field: keyof LocalSettings, value: string | boolean) => {
      if (!isHost) return;
      setLocalSettings(prev => ({ ...prev, [field]: value }));
    },
    [isHost],
  );

  const handleScoreChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isHost) return;
      const value = e.target.value;
      // Улучшенная валидация: только цифры, максимум 3 символа, убираем ведущие нули
      const numericValue = value.replace(/\D/g, '').slice(0, 3);
      const normalizedValue = numericValue.replace(/^0+/, '') || '';
      handleChange('scoreToWin', normalizedValue);
    },
    [isHost, handleChange],
  );

  const handleBlurTime = useCallback(() => {
    const parsed = Number(localSettings.roundTime);
    const validated = validateRoundTime(parsed);
    const rounded = applyRoundTimeStep(validated);
    const finalValue = Math.max(10, Math.min(100, rounded));
    setLocalSettings(prev => ({
      ...prev,
      roundTime: finalValue.toString(),
    }));
  }, [localSettings.roundTime]);

  const handleBlurPoints = useCallback(() => {
    const parsed = Number(localSettings.scoreToWin);
    const validated = validateRoundPoints(parsed, players);
    const finalValue =
      localSettings.scoreToWin.trim() === '' || validated < minScoreToWin
        ? minScoreToWin.toString()
        : validated.toString();
    setLocalSettings(prev => ({ ...prev, scoreToWin: finalValue }));
  }, [localSettings.scoreToWin, players, minScoreToWin]);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!isHost) return;

      // 1) Очки/время/цензура
      const roundTimeNumber = applyRoundTimeStep(
        Number(localSettings.roundTime) || roundTimeRedux,
      );
      const scoreToWinNumber = validateRoundPoints(
        localSettings.scoreToWin || scoreToWinRedux.toString(),
        players,
      );

      // Дополнительная валидация перед отправкой
      if (roundTimeNumber < 10 || roundTimeNumber > 100) {
        console.error('Invalid round time:', roundTimeNumber);
        return;
      }

      if (scoreToWinNumber < minScoreToWin || scoreToWinNumber > 999) {
        console.error('Invalid score to win:', scoreToWinNumber);
        return;
      }

      onSubmit({
        scoreToWin: scoreToWinNumber,
        roundTime: roundTimeNumber,
        censorship: localSettings.censorship,
        isPrivate: localSettings.isPrivate,
        password: localSettings.isPrivate ? localSettings.password : undefined,
        theme,
      });
    },
    [
      isHost,
      localSettings,
      roundTimeRedux,
      scoreToWinRedux,
      players,
      minScoreToWin,
      onSubmit,
      theme,
      send,
      lobbyId,
      setLobbyPassword,
    ],
  );

  // значения для UI
  const uiRoundTime = isHost
    ? localSettings.roundTime
    : roundTimeRedux.toString();
  const uiScoreToWin = isHost
    ? localSettings.scoreToWin
    : scoreToWinRedux.toString();

  return (
    <form
      className="modal-game-settings__text no-select"
      onSubmit={handleSubmit}
      data-theme={theme}
      data-game-mode={
        theme === 'fufl' ? 'fuflomicin' : theme === 'game' ? 'bj' : theme
      }
    >
      {/* Время раунда */}
      <div className={`d-flex ${styles.input__number}`}>
        <label htmlFor="round-time">Время раунда (сек):</label>
        <input
          id="round-time"
          className={`${styles.input__number_input} ${
            theme === 'game'
              ? styles.input__number_input__game
              : theme === 'fufl'
                ? styles.input__number_input__fufl
                : theme === 'hff'
                  ? styles.input__number_input__hff
                  : ''
          }`}
          type="number"
          min={10}
          max={100}
          step={5}
          value={uiRoundTime}
          onChange={e => handleChange('roundTime', e.target.value)}
          onBlur={handleBlurTime}
          disabled={!isHost}
        />
        {isHost && (
          <>
            <div
              className={`${styles['input__number-upper']}`}
              onClick={() => {
                const currentValue = Number(localSettings.roundTime) || 10;
                const newValue = Math.min(100, currentValue + 5);
                handleChange('roundTime', newValue.toString());
              }}
            >
              <img src="/img/arrow-up.svg" alt="Увеличить" />
            </div>
            <div
              className={`${styles['input__number-lower']}`}
              onClick={() => {
                const currentValue = Number(localSettings.roundTime) || 10;
                const newValue = Math.max(10, currentValue - 5);
                handleChange('roundTime', newValue.toString());
              }}
            >
              <img src="/img/arrow-down.svg" alt="Уменьшить" />
            </div>
          </>
        )}
      </div>

      {/* Баллы до победы */}
      <div className="d-flex input__number">
        <label htmlFor="points-win">Баллы для победы:</label>
        <input
          id="points-win"
          className={`${styles.input__number_input} ${
            theme === 'game'
              ? styles.input__number_input__game
              : theme === 'fufl'
                ? styles.input__number_input__fufl
                : theme === 'hff'
                  ? styles.input__number_input__hff
                  : ''
          }`}
          type="text"
          pattern="\d*"
          min={minScoreToWin}
          max={999}
          step={1}
          value={uiScoreToWin}
          onChange={handleScoreChange}
          onBlur={handleBlurPoints}
          disabled={!isHost}
        />
        {isHost && (
          <>
            <div
              className={`${styles['input__number-upper']}`}
              onClick={() => {
                const currentValue = Number(localSettings.scoreToWin) || 0;
                const newValue = Math.min(999, currentValue + 1);
                handleChange('scoreToWin', newValue.toString());
              }}
            >
              <img src="/img/arrow-up.svg" alt="Увеличить" />
            </div>
            <div
              className={`${styles['input__number-lower']}`}
              onClick={() => {
                const currentValue = Number(localSettings.scoreToWin) || 0;
                const newValue = currentValue - 1;
                if (newValue < minScoreToWin) {
                  showToast(
                    `Минимальное значение для победных баллов - ${minScoreToWin}`,
                  );
                  return;
                }
                handleChange('scoreToWin', newValue.toString());
              }}
            >
              <img src="/img/arrow-down.svg" alt="Уменьшить" />
            </div>
          </>
        )}
      </div>

      {/* Приглашение */}
      {isHost && <InviteLink lobbyId={lobbyId} theme={theme} />}
      {isHost && (
        <Button
          className={`w-50 mx-auto ${styles.gameBtn}`}
          type="submit"
          data-bs-dismiss="modal"
          data-theme={theme}
          aria-label="Закрыть"
          disabled={
            localSettings.scoreToWin.trim() === '' ||
            Number(localSettings.scoreToWin) < minScoreToWin
          }
        >
          Сохранить <BtnIcon src="/img/YES.svg" />
        </Button>
      )}
    </form>
  );
};
