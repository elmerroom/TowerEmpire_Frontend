import { useEffect, useRef, memo } from 'react';
import { useSelector } from 'react-redux';
import { animate as frameMotionAnimate } from 'framer-motion';
import { useTimer, useCountdownSound } from '@/components/helpers/hooks';
import { getGameStatus } from '@/store/fuflomicin/fuflSlice';
import type { RootState } from '@/store/store';
import styles from './Timer.module.scss';

// Функция для создания SVG path для круга-таймера (pie chart)
const createPiePath = (
  cx: number,
  cy: number,
  radius: number,
  progress: number,
): string => {
  if (progress <= 0) return '';
  if (progress >= 1) {
    // Полный круг
    return `M ${cx},${cy} m 0,-${radius} a ${radius},${radius} 0 1,1 0,${radius * 2} a ${radius},${radius} 0 1,1 0,-${radius * 2}`;
  }

  // Угол в радианах (начинаем сверху, идём по часовой)
  const angle = progress * 2 * Math.PI;

  // Начальная точка (сверху)
  const startX = cx;
  const startY = cy - radius;

  // Конечная точка дуги
  const endX = cx + radius * Math.sin(angle);
  const endY = cy - radius * Math.cos(angle);

  // Флаг большой дуги (если угол > 180°)
  const largeArcFlag = angle > Math.PI ? 1 : 0;

  // Строим path: центр -> начало -> дуга -> центр
  return `M ${cx},${cy} L ${startX},${startY} A ${radius},${radius} 0 ${largeArcFlag},1 ${endX},${endY} Z`;
};

export const Timer = memo(() => {
  const pathRef = useRef<SVGPathElement>(null);
  const arrowLineRef = useRef<SVGLineElement>(null);
  const currentProgressRef = useRef(1);
  const prevRoundIdRef = useRef<number | null>(null);
  const prevIsTimerRunRef = useRef<boolean>(false);

  // Получаем данные из fuflSlice
  const initialTime = useSelector(
    (state: RootState) => state.fuflGame.currentRound.timerTime ?? 60,
  );
  const isTimerRun = useSelector(
    (state: RootState) => state.fuflGame.isTimerRun,
  );

  const roundId = useSelector(
    (state: RootState) => state.fuflGame.currentRound.id,
  );

  const { count, restart, pause, active, resume } = useTimer(0, {
    immediately: false,
  });

  // Рестарт таймера только при реальной смене раунда или изменении isTimerRun
  useEffect(() => {
    const roundChanged =
      prevRoundIdRef.current !== null && prevRoundIdRef.current !== roundId;
    const timerRunChanged = prevIsTimerRunRef.current !== isTimerRun;
    // Запускаем таймер только когда isTimerRun становится true
    if (isTimerRun && initialTime > 0) {
      if (roundChanged) {
        restart(Math.ceil(initialTime), true);
      } else if (timerRunChanged && !active) {
        count > 0 ? resume() : restart(Math.ceil(initialTime), true);
      }
    } else if (!isTimerRun && active) {
      pause();
    }

    prevRoundIdRef.current = roundId;
    prevIsTimerRunRef.current = isTimerRun;
  }, [roundId, isTimerRun, initialTime, restart, pause, active]);

  // Размеры круга: диаметр 96.24px, центр 48.12
  const cx = 48.12;
  const cy = 48.12;
  const radius = 48.12; // Полный радиус круга

  useEffect(() => {
    if (!pathRef.current || !arrowLineRef.current) return;

    // Не анимируем пока игра не началась (count === 0 и таймер не запущен)
    if (count === 0 && !active) {
      // Устанавливаем полный круг без анимации
      currentProgressRef.current = 1;
      const fullPath = createPiePath(cx, cy, radius, 1);
      pathRef.current.setAttribute('d', fullPath);
      arrowLineRef.current.setAttribute('x2', String(cx));
      arrowLineRef.current.setAttribute('y2', String(cy - radius));
      return;
    }

    // Прогресс от 0 (пусто) до 1 (полный круг)
    // Если осталась 1 секунда или меньше — всегда анимируем до 0
    const targetProgress = count <= 1 ? 0 : count / initialTime;
    const currentProgress = currentProgressRef.current;

    // Анимируем прогресс с помощью framer-motion
    frameMotionAnimate(currentProgress, targetProgress, {
      duration: 1,
      ease: 'linear',
      onUpdate: latest => {
        currentProgressRef.current = latest;
        const newPath = createPiePath(cx, cy, radius, latest);
        if (pathRef.current) {
          pathRef.current.setAttribute('d', newPath);
        }

        // Обновляем позицию стрелки
        const angle = latest * 2 * Math.PI;
        const endX = cx + radius * Math.sin(angle);
        const endY = cy - radius * Math.cos(angle);

        if (arrowLineRef.current) {
          arrowLineRef.current.setAttribute('x2', String(endX));
          arrowLineRef.current.setAttribute('y2', String(endY));
        }
      },
    });
  }, [count, initialTime, active, cx, cy, radius]);

  const gameStatus = useSelector(getGameStatus);
  const isPaused = gameStatus === 'paused';

  // Мигающая подсветка при count < 10
  const isLowTime = count > 0 && count < 10 && isTimerRun;

  useCountdownSound({
    count,
    isActive: active && isTimerRun,
    soundUrl: '/sounds/timer-tik.mp3',
  });

  return (
    <div className={styles.timer}>
      {/* Мигающая подсветка сзади круга */}
      <div
        className={`${styles.timerGlow} ${isLowTime ? styles.active : ''}`}
      />

      {/* Фоновое изображение */}
      <div className={styles.timerBackground} />

      {/* SVG круг таймера */}
      <svg
        className={styles.timerSvg}
        width="120"
        height="120"
        viewBox="-24 -12 120.24 120.24"
        style={{ overflow: 'visible' }}
      >
        {/* SVG фильтр для glow эффекта */}
        <defs>
          <filter id="glowFilter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur1" />
            <feFlood floodColor="rgba(255, 60, 60, 1)" result="color" />
            <feComposite in="color" in2="blur1" operator="in" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Фоновый круг (серый) */}
        <circle
          className={styles.timerCircleBackground}
          cx={cx}
          cy={cy}
          r={radius}
          fill="#333"
          opacity="0.2"
        />

        {/* Анимированный круг прогресса */}
        <path
          ref={pathRef}
          className={`${styles.timerCircleProgress} ${isLowTime ? styles.glowPulse : ''}`}
          fill="rgba(178, 30, 30, 0.85)"
          filter={isLowTime ? 'url(#glowFilter)' : undefined}
        />

        {/* Стрелка таймера */}
        <line
          ref={arrowLineRef}
          className={styles.timerArrow}
          x1={cx}
          y1={cy}
          x2={cx}
          y2={cy - radius}
          stroke="#ffb546"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Точка в центре */}
        <circle cx={cx} cy={cy} r="4" fill="#ffb546" />
      </svg>

      {/* Текст с оставшимся временем */}
      {/* <div className={styles.timerText}>{count > 0 ? count : 0}</div> */}

      {isPaused && <div className={styles.pauseLabel}>ПАУЗА</div>}
    </div>
  );
});
