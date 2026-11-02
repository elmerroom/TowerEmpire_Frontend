import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { descriptionBlackJokes } from '../const/descriptionBlackJokes';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import { UniversalModal } from '../../../shared/universal-modal/UniversalModal';
import { getGameModeClass } from '@/utils/gameModeClass';

export const ModalGameDescription = ({ isOpen, onClose, description }) => {
  const gameMode = useSelector(state => state.modal.gameMode);
  const modalClass = getGameModeClass(gameMode, 'modal');
  const content = description ?? descriptionBlackJokes;

  return (
    <AnimatePresence>
      {isOpen && (
        <UniversalModal
          isOpen={isOpen}
          onClose={onClose}
          showCloseButton
          portalTarget={gameMode ? '#game-modal-root' : 'body'}
          className={modalClass}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <div className="border-0 d-flex justify-content-between align-items-center">
              <h1 className="my-modal-title title-white">{content.title}</h1>
            </div>

            <hr className="hr-line" size="5" />

            <div className="modal-game-help__text mb-3">
              <SimpleBar style={{ maxHeight: '60vh' }}>
                {content.sections.map((section, sIdx) => (
                  <motion.div
                    key={sIdx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: sIdx * 0.1 }}
                  >
                    <p
                      className={`fw-bold ${getGameModeClass(gameMode, 'textColor') || 'text-color-blue'}`}
                    >
                      {section.heading}
                    </p>
                    {section.paragraphs.map((paragraph, pIdx) => (
                      <motion.p
                        key={pIdx}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{
                          duration: 0.3,
                          delay: sIdx * 0.1 + pIdx * 0.05,
                        }}
                      >
                        {paragraph}
                      </motion.p>
                    ))}
                  </motion.div>
                ))}
              </SimpleBar>
            </div>
          </motion.div>
        </UniversalModal>
      )}
    </AnimatePresence>
  );
};
