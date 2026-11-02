import {
  useCallback,
  useEffect,
  forwardRef,
  type ReactNode,
  type MouseEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import styles from './UniversalModal.module.scss';

interface UniversalModalProps {
  isOpen: boolean;
  onClose?: () => void;
  closeable?: boolean;
  closeOnOverlay?: boolean;
  showCloseButton?: boolean;
  portalTarget?: string;
  className?: string;
  children: ReactNode;
  'data-game-mode'?: string;
}

export const UniversalModal = forwardRef<HTMLDivElement, UniversalModalProps>(
  (
    {
      isOpen,
      onClose,
      closeable = true,
      closeOnOverlay = true,
      showCloseButton = false,
      portalTarget,
      className,
      children,
      'data-game-mode': gameMode,
    },
    ref,
  ) => {
    const handleOverlayClick = useCallback(
      (e: MouseEvent<HTMLDivElement>) => {
        if (
          e.target === e.currentTarget &&
          closeable &&
          closeOnOverlay &&
          onClose
        ) {
          onClose();
        }
      },
      [closeable, closeOnOverlay, onClose],
    );

    const handleCloseButton = useCallback(() => {
      if (closeable && onClose) {
        onClose();
      }
    }, [closeable, onClose]);

    useEffect(() => {
      if (!isOpen || !closeable || !onClose) return;

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, closeable, onClose]);

    const modal = (
      <div
        ref={ref}
        className={`${styles.overlay} ${isOpen ? styles.visible : styles.hidden}`}
        onClick={handleOverlayClick}
      >
        <div
          className={`${styles.content} ${className || ''}`}
          data-game-mode={gameMode}
        >
          {showCloseButton && closeable && (
            <button
              className={`${styles.closeButton} modal-close-btn`}
              onClick={handleCloseButton}
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          )}
          {children}
        </div>
      </div>
    );

    const targetEl = portalTarget
      ? document.querySelector(portalTarget)
      : document.getElementById('game-modal-root');
    const portalNode = targetEl || document.body;

    return createPortal(modal, portalNode);
  },
);

UniversalModal.displayName = 'UniversalModal';
