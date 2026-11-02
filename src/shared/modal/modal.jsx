import { useState, useEffect } from 'react';
import { UniversalModal } from '../universal-modal/UniversalModal';

export const Modal = ({
  gamePhase,
  currentGamePhase,
  children,
  closeButton = false,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const isFinishPhase =
    gamePhase === 'finish_game' || gamePhase === 'FINISH_GAME';

  useEffect(() => {
    if (currentGamePhase === gamePhase) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [currentGamePhase, gamePhase]);

  return (
    <UniversalModal
      isOpen={isVisible}
      onClose={() => setIsVisible(false)}
      closeable={!isFinishPhase}
      showCloseButton={closeButton}
      className={className}
    >
      {children}
    </UniversalModal>
  );
};
