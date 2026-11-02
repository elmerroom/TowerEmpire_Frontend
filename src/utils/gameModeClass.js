const GAME_MODE_CLASS_MAP = {
  fuflomicin: {
    modal: 'fufl-modal',
    btn: 'fuflBtn',
    theme: 'fufl',
    textColor: 'text-color-gold',
  },
  hff: {
    modal: 'hff-modal',
    btn: 'hffBtn',
    theme: 'hff',
    textColor: 'text-color-red',
  },
  bj: {
    modal: 'game-modal',
    btn: 'gameBtn',
    theme: 'game',
    textColor: 'text-color-gold',
  },
};

export const getGameModeClass = (gameMode, variant = 'modal') => {
  if (variant === 'theme') {
    return (
      GAME_MODE_CLASS_MAP[gameMode]?.theme || (gameMode ? 'game' : 'lobby')
    );
  }
  if (!gameMode) return '';
  if (variant === 'textColor') {
    return GAME_MODE_CLASS_MAP[gameMode]?.textColor || 'text-color-blue';
  }
  return (
    GAME_MODE_CLASS_MAP[gameMode]?.[variant] ||
    (variant === 'modal' ? 'game-modal' : 'gameBtn')
  );
};
