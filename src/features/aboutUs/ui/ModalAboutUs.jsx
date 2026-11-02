import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import { ModalSVG } from '../../../shared/svg/modal_svg';
import { descriptionAboutUs } from '../const/descriptionAboutUs';
import styles from './ModalAboutUs.module.scss';
import { UniversalModal } from '../../../shared/universal-modal/UniversalModal';
import { Button } from '../../../shared/ui/Button';

export const ModalAboutUs = ({ isOpen, onClose }) => {
  const gameMode = useSelector(state => state.modal.gameMode);
  const modalClass =
    gameMode === 'fuflomicin' ? 'fufl-modal' : gameMode ? 'game-modal' : '';

  return (
    <AnimatePresence>
      {isOpen && (
        <UniversalModal
          isOpen={isOpen}
          onClose={onClose}
          showCloseButton
          portalTarget="body"
          className={modalClass}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
          >
            <div className="border-0 d-flex flex-column justify-content-between align-items-center position-relative">
              <h1 className="my-modal-title title-white mb-2">
                {descriptionAboutUs.title}
              </h1>
              <h2 className="my-modal-title title-white text-color-blue">
                {descriptionAboutUs.subtitle}
              </h2>
              <ModalSVG></ModalSVG>
            </div>

            <div className="modal-game-help__text mb-3">
              <SimpleBar className={styles.modalScrollbar}>
                <div>
                  <p className="text-white mb-2">
                    {descriptionAboutUs.description}
                  </p>
                  <p className="text-color-blue mb-4 text-center">
                    {descriptionAboutUs.sound}
                  </p>
                  <p className="text-white mb-2">
                    {descriptionAboutUs.supportText}
                  </p>
                  <p className="text-white mb-2">
                    {descriptionAboutUs.supportCardText}
                  </p>
                  <p className={styles['supportCardNumber']}>
                    {descriptionAboutUs.supportCardNumber}
                  </p>
                  <p className={styles['supportCardImg']}>
                    <img src="/img/cat-leave.gif" alt="SadCat" />
                  </p>

                  <p className="text-color-blue fw-bold mb-4">
                    Почта для сотрудничества:
                    <a
                      href={`mailto:${descriptionAboutUs.email}`}
                      className="text-color-blue fw-bold cursor-pointer"
                    >
                      {descriptionAboutUs.email}
                    </a>
                  </p>
                  <div className={styles.social}>
                    <div>
                      <a
                        href="https://discord.gg/bYjdJsK5ZH"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button className={styles['social__btn-discord']} />
                      </a>
                    </div>
                    <div>
                      <a
                        href="https://boosty.to/towerdragon/donate"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button className={styles['social__btn-boosty']} />
                      </a>
                    </div>
                    <div>
                      <a
                        href="https://vk.com/towerempire"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button className={styles['social__btn-vk']} />
                      </a>
                    </div>

                    <div>
                      <a
                        href="https://t.me/tower_empire"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button className={styles['social__btn-telegram']} />
                      </a>
                    </div>
                  </div>
                  <h3 className="my-modal-title title-white">
                    {descriptionAboutUs.header}
                  </h3>
                  <h4 className={styles['social__subheader']}>
                    {descriptionAboutUs.subHeader}
                  </h4>
                </div>
                {descriptionAboutUs.sections.map((section, sIdx) => (
                  <motion.div
                    key={sIdx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.15 }}
                  >
                    <p
                      className={`mt-4 mb-2 fw-bold ${gameMode ? 'text-color-gold' : 'text-color-blue'}`}
                    >
                      {section.heading}
                    </p>
                    {section.paragraphs.map((paragraph, pIdx) => (
                      <motion.li
                        key={pIdx}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{
                          duration: 0.15,
                        }}
                      >
                        {paragraph}
                      </motion.li>
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
