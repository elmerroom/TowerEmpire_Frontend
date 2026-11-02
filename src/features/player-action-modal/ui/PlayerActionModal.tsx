import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { ModalSVG } from '@/shared/svg/modal_svg';
import { BtnIcon } from '@/shared/ui/BtnIcon';
import { usePlayerAction } from '../hooks/usePlayerAction';
import styles from './PlayerActionModal.module.scss';
import { Button } from '@/shared/ui/Button';

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.9, y: -20 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.9, y: -20 },
};

const contentVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const PlayerActionModal: React.FC = () => {
  const { state, closeModal, confirmAction } = usePlayerAction();
  const { isOpen, mode, player, variant, interactionStatus, errorMessage } =
    state;
  const isPending = interactionStatus === 'pending';

  if (!isOpen) return null;
  if (mode !== 'info' && !player) return null;

  const isGame = variant === 'game' || variant === 'fufl' || variant === 'hff';
  const variantClass =
    variant === 'fufl'
      ? 'fuflVariant'
      : variant === 'hff'
        ? 'hffVariant'
        : isGame
          ? 'gameVariant'
          : 'lobbyVariant';

  // Определяем контейнер для портала
  const container = isGame
    ? document.getElementById('game-modal-root') || document.body
    : document.body;

  // Тексты в зависимости от режима
  let title = '';
  let questionText = '';

  if (mode === 'kick') {
    title = 'Удаление игрока';
    questionText = isPending
      ? 'Отправляем запрос на удаление игрока...'
      : isGame
        ? 'Вы собираетесь удалить игрока из игры?'
        : 'Вы собираетесь удалить игрока из комнаты?';
  } else if (mode === 'promote') {
    title = 'Передача прав хоста';
    questionText = isPending
      ? 'Отправляем запрос на передачу прав хоста...'
      : 'Вы собираетесь передать права хоста игроку?';
  } else if (mode === 'info') {
    title = 'Исключение';
    questionText = state.message || 'Вас исключили из лобби';
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.overlay}
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.2 }}
          onClick={isPending ? undefined : closeModal}
        >
          <motion.div
            className={`${styles.modal} ${variant === 'fufl' ? styles.modalFufl : variant === 'hff' ? styles.modalHff : isGame ? styles.modalGame : styles.modalLobby}`}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className={styles.header}>
              <h1 className={styles.title}>{title}</h1>
              <Button
                className={styles.closeBtn}
                onClick={closeModal}
                aria-label="Закрыть"
                disabled={isPending}
              >
                <FontAwesomeIcon icon={faXmark} />
              </Button>
            </div>

            {/* Decorative SVG */}
            <ModalSVG />

            {/* Body */}
            <motion.div
              className={styles.body}
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.1, duration: 0.2 }}
            >
              <p className={styles.text}>{questionText}</p>
              {mode !== 'info' && player && (
                <>
                  <span
                    className={`${styles.playerName} ${variant === 'fufl' ? styles.playerNameFufl : variant === 'hff' ? styles.playerNameHFF : isGame ? styles.playerNameGame : styles.playerNameLobby}`}
                  >
                    {player.username}
                  </span>
                  <p className={styles.text}>Подтверждаете ваш выбор?</p>
                </>
              )}
              {errorMessage && (
                <p className={styles.errorText}>{errorMessage}</p>
              )}
            </motion.div>

            {/* Footer */}
            <motion.div
              className={styles.footer}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.2 }}
            >
              {mode !== 'info' ? (
                <>
                  <Button
                    className={`${styles.btn} ${styles.btnOutline} ${styles[variantClass]}`}
                    onClick={closeModal}
                    disabled={isPending}
                  >
                    Нет <BtnIcon src="/img/NO.svg" />
                  </Button>
                  <Button
                    className={`${styles.btn} ${styles.btnConfirm} ${styles[variantClass]}`}
                    onClick={confirmAction}
                    disabled={isPending}
                  >
                    {isPending ? (
                      'Отправка...'
                    ) : (
                      <>
                        Да <BtnIcon src="/img/YES.svg" />
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <Button
                  className={`${styles.btn} ${styles.btnConfirm} ${styles[variantClass]}`}
                  onClick={confirmAction}
                  style={{ margin: '0 auto' }}
                >
                  ОК
                </Button>
              )}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    container,
  );
};

export default PlayerActionModal;
