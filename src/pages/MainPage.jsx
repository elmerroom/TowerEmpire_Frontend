import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import styles from './MainPage.module.scss';
import { ModalAboutUs } from '../features/aboutUs/ui/ModalAboutUs';
import { AnimatedDiceD20 } from '../components/AnimatedDice';
import { Button } from '../shared/ui/Button';

// Компонент: MainPage
export const MainPage = () => {
  const navigate = useNavigate();
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showAboutUs, setShowAboutUs] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isSafari =
    /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);

  const handleStartPlay = () => {
    navigate('/lobby');
  };

  const handleScrollToTop = () => {
    // Ищем элемент SimpleBar для скролла
    const scrollElement =
      document.querySelector('.main-scrollbar .simplebar-content-wrapper') ||
      document.querySelector('.simplebar-content-wrapper');

    if (scrollElement) {
      // Плавный скролл до верха для SimpleBar
      scrollElement.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    } else {
      // Fallback для обычного скролла окна
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };

  const handleSmoothScrollTo = id => e => {
    e.preventDefault();
    const target = document.getElementById(id);
    if (!target) return;

    const scrollElement =
      document.querySelector('.main-scrollbar .simplebar-content-wrapper') ||
      document.querySelector('.simplebar-content-wrapper');

    if (scrollElement) {
      const containerRect = scrollElement.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const HEADER_HEIGHT = 75;
      const top =
        targetRect.top -
        containerRect.top +
        scrollElement.scrollTop -
        HEADER_HEIGHT;

      scrollElement.scrollTo({ top, behavior: 'smooth' });
    } else {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Анимации
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  const fadeInLeft = {
    hidden: { opacity: 0, x: -60 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  const fadeInRight = {
    hidden: { opacity: 0, x: 60 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  // Отслеживание скролла для показа кнопки "вверх"
  useEffect(() => {
    const handleScroll = () => {
      // Ищем элемент SimpleBar для отслеживания скролла
      const scrollElement =
        document.querySelector('.main-scrollbar .simplebar-content-wrapper') ||
        document.querySelector('.simplebar-content-wrapper');

      if (scrollElement) {
        const scrollTop = scrollElement.scrollTop;
        const scrollHeight = scrollElement.scrollHeight;
        const clientHeight = scrollElement.clientHeight;

        // Вычисляем процент прокрутки
        const scrollPercent = (scrollTop / (scrollHeight - clientHeight)) * 100;

        // Показываем кнопку если прокрутили больше 50%
        setShowScrollButton(scrollPercent > 50);
      } else {
        // Fallback для обычного скролла окна
        const scrollTop =
          window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = window.innerHeight;

        const scrollPercent = (scrollTop / (scrollHeight - clientHeight)) * 100;
        setShowScrollButton(scrollPercent > 50);
      }
    };

    // Ищем элемент SimpleBar для добавления обработчика
    const scrollElement =
      document.querySelector('.main-scrollbar .simplebar-content-wrapper') ||
      document.querySelector('.simplebar-content-wrapper');

    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll);
      // Проверяем начальное состояние
      handleScroll();

      return () => {
        scrollElement.removeEventListener('scroll', handleScroll);
      };
    } else {
      // Fallback для обычного скролла
      window.addEventListener('scroll', handleScroll);
      handleScroll();

      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);

  // Закрытие боковой панели по Escape
  useEffect(() => {
    if (!isMenuOpen) return;
    const onKeyDown = e => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isMenuOpen]);

  // Блокировка скролла фона при открытом меню
  useEffect(() => {
    if (!isMenuOpen) return;
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevBodyOverflow || '';
      document.documentElement.style.overflow = prevHtmlOverflow || '';
    };
  }, [isMenuOpen]);

  return (
    <div className={styles.page}>
      <header className={styles.stickyHeader}>
        <div className={styles.stickyHeaderWrapper}>
          <div className={styles.left}>
            <img
              src="/img/LogoTowerEmpire.svg"
              alt="Evil Cards"
              className={styles.logo}
              onClick={handleScrollToTop}
              style={{ cursor: 'pointer' }}
            />
          </div>
          <nav className={styles.stickyHeaderNav}>
            <a href="#rooms" onClick={handleStartPlay}>
              {' '}
              Играть{' '}
            </a>
            <div
              style={{
                position: 'absolute',
                opacity: 0,
                pointerEvents: 'none',
                zIndex: -1,
              }}
            >
              <input
                type="checkbox"
                name="human_check"
                tabIndex="-1"
                autoComplete="off"
              />
            </div>
            <a
              href="#about"
              onClick={e => {
                e.preventDefault();
                setShowAboutUs(true);
              }}
            >
              О нас
            </a>
            <a href="#start" onClick={handleSmoothScrollTo('start')}>
              Как начать
            </a>
            <a href="#contacts" onClick={handleSmoothScrollTo('contacts')}>
              Контакты
            </a>
          </nav>
          {/* Бургер с 6 точками — показывается на ≤768px */}
          <Button
            className={styles.stickyHeaderBurger}
            aria-label="Открыть меню"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen(true)}
          >
            <span className={styles.burgerDot} />
            <span className={styles.burgerDot} />
            <span className={styles.burgerDot} />
            <span className={styles.burgerDot} />
            <span className={styles.burgerDot} />
            <span className={styles.burgerDot} />
          </Button>
        </div>
      </header>

      {/* Боковая панель и оверлей с анимацией закрытия */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              key="overlay"
              className={styles.sidePanelOverlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.aside
              key="panel"
              className={styles.sidePanel}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
            >
              <nav className={styles.sidePanelNav}>
                <a
                  href="#rooms"
                  onClick={e => {
                    e.preventDefault();
                    setIsMenuOpen(false);
                    handleStartPlay();
                  }}
                >
                  Играть
                </a>
                <div
                  style={{
                    position: 'absolute',
                    opacity: 0,
                    pointerEvents: 'none',
                    zIndex: -1,
                  }}
                >
                  <input
                    type="checkbox"
                    name="user_verified"
                    tabIndex="-1"
                    autoComplete="off"
                  />
                </div>
                <a
                  href="#about"
                  onClick={e => {
                    e.preventDefault();
                    setIsMenuOpen(false);
                    setShowAboutUs(true);
                  }}
                >
                  О нас
                </a>
                <a
                  href="#start"
                  onClick={e => {
                    setIsMenuOpen(false);
                    handleSmoothScrollTo('start')(e);
                  }}
                >
                  Как начать
                </a>
                <a
                  href="#contacts"
                  onClick={e => {
                    setIsMenuOpen(false);
                    handleSmoothScrollTo('contacts')(e);
                  }}
                >
                  Контакты
                </a>
              </nav>
              <div className={styles.sidePanelFooterLogo}>
                <img
                  src="/img/LogoTowerEmpire.svg"
                  alt="Tower Empire"
                  loading="lazy"
                />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
      <motion.section
        className={styles.header}
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <div className={styles.container}>
          <div className={styles.headerWrapper}>
            <motion.div
              className={styles.headerTextWrapper}
              variants={fadeInLeft}
            >
              <motion.h1 className={styles.headerTitle} variants={fadeInUp}>
                Играй <br /> в настольные игры <br /> онлайн вместе <br /> с
                друзьями
              </motion.h1>
              <motion.p className={styles.headerText} variants={fadeInUp}>
                Мы рады приветствовать тебя на платформе, где можно поиграть в
                различные настольные игры онлайн!
              </motion.p>
              <motion.p className={styles.headerSubtitle} variants={fadeInUp}>
                Приходи отдохнуть от мирских забот в ламповой атмосфере!
              </motion.p>
              <motion.div
                className={styles.headerButtonWrap}
                variants={fadeInUp}
              >
                <motion.button
                  className={styles.headerPlayButton}
                  onClick={handleStartPlay}
                  whileHover={{
                    scale: 1.05,
                    boxShadow: '0 0 16px rgba(78, 181, 181, 0.55)',
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  Начать играть
                </motion.button>
                <div
                  style={{
                    position: 'absolute',
                    opacity: 0,
                    pointerEvents: 'none',
                    zIndex: -1,
                  }}
                >
                  <input
                    type="checkbox"
                    name="accept_terms_trap"
                    tabIndex="-1"
                    autoComplete="off"
                  />
                </div>
                <motion.button
                  className={styles.headerHowButton}
                  whileHover={{
                    scale: 1.05,
                    boxShadow: '0 0 16px rgba(78, 181, 181, 0.55)',
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSmoothScrollTo('start')}
                >
                  Как играть?
                </motion.button>
              </motion.div>
            </motion.div>
            <motion.div
              className={styles.headerImgWrapper}
              variants={fadeInRight}
            >
              <motion.video
                src={isSafari ? '/video/cat-dice.mov' : '/video/cat-dice.webm'}
                className={styles.headerMaskot}
                aria-label="Maskot"
                autoPlay
                loop
                muted
                playsInline
              />
            </motion.div>
          </div>

          <div className={styles.headerDevider}>
            <svg
              aria-hidden="true"
              style={{ width: '100%', height: '100%', display: 'block' }}
            >
              <use href="#deviderr" />
            </svg>
          </div>
        </div>
      </motion.section>

      <motion.section
        id="start"
        className={styles.start}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1, margin: '0px 0px 200px 0px' }}
        variants={staggerContainer}
      >
        <div className={styles.container}>
          <motion.h2 className={styles.startHeader} variants={fadeInUp}>
            Как начать играть за 3 минуты?
          </motion.h2>
          <motion.p className={styles.startSubHeader} variants={fadeInUp}>
            Никаких сложных настроек или долгих обучений. <br />
            Просто зарегистрируйся и начни играть прямо сейчас.
          </motion.p>
          <div className={styles.startWrapper}>
            <motion.div
              className={styles.startWrapperLeft}
              variants={staggerContainer}
            >
              <motion.div
                className={styles.startWrapperLeftCard}
                variants={scaleIn}
                whileHover={{
                  scale: 1.02,
                  transition: { duration: 0.3 },
                }}
              >
                <motion.img
                  src="/img/1.svg"
                  alt="number1"
                  className={styles.startWrapperLeftImg}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                />
                <div className={styles.startWrapperLeftCardTextWrapper}>
                  <p className={styles.startWrapperLeftCardTitle}>
                    Поиск комнаты
                  </p>
                  <p className={styles.startWrapperLeftCardText}>
                    Комната (лобби) — это виртуальное место для игры. В списке
                    столов видно: игру, количество игроков и статус комнаты
                    (открыта/закрыта). Нажмите `Создать комнату` или
                    `Присоединиться`.
                  </p>
                </div>
              </motion.div>

              <motion.div
                className={styles.startWrapperLeftCard}
                variants={scaleIn}
                whileHover={{
                  scale: 1.02,
                  transition: { duration: 0.3 },
                }}
              >
                <motion.img
                  src="/img/2.svg"
                  alt="number2"
                  className={styles.startWrapperLeftImg}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                />
                <div className={styles.startWrapperLeftCardTextWrapper}>
                  <p className={styles.startWrapperLeftCardTitle}>
                    Приглашения и настройки
                  </p>
                  <p className={styles.startWrapperLeftCardText}>
                    Создавая комнату, ты становишься хостом — администратором
                    игры. Ты выбираешь во что играть, можешь менять настройки, а
                    также приглашать друзей по специальной ссылке. Присоединяясь
                    к уже созданной комнате, ты становишься игроком и играешь по
                    заданным настройкам. Ознакомиться с правилами выбранной игры
                    можно при нажатии на значок шестеренки.
                  </p>
                </div>
              </motion.div>

              <motion.div
                className={styles.startWrapperLeftCard}
                variants={scaleIn}
                whileHover={{
                  scale: 1.02,
                  transition: { duration: 0.3 },
                }}
              >
                <motion.img
                  src="/img/3.svg"
                  alt="number3"
                  className={styles.startWrapperLeftImg}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                />
                <div className={styles.startWrapperLeftCardTextWrapper}>
                  <p className={styles.startWrapperLeftCardTitle}>
                    Начало игровой сессии
                  </p>
                  <p className={styles.startWrapperLeftCardText}>
                    После того, как все игроки присоединились по ссылке и
                    настройки выставлены, хост запускает игру. Наслаждайтесь!
                  </p>
                </div>
              </motion.div>
            </motion.div>
            <motion.div
              className={styles.startWrapperRight}
              variants={fadeInRight}
            >
              <motion.img
                src="/img/fireplace.png"
                alt="fireplace"
                className={styles.startWrapperRightImg}
                whileHover={{
                  scale: 1.05,
                  transition: { duration: 0.3 },
                }}
              />
            </motion.div>
          </div>
        </div>
        <motion.div
          className={styles.startRegistrationWrapper}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={fadeInUp}
        >
          <motion.p
            className={styles.startRegistrationHeader}
            variants={fadeInUp}
          >
            Регистрация открывает достижения, историю игр и улучшенный профиль.
          </motion.p>
          <motion.button
            className={styles.startRegistrationButton}
            variants={scaleIn}
            whileHover={{
              scale: 1.05,
              boxShadow: '0 0 16px rgba(78, 181, 181, 0.55)',
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/lobby?autoRegister=true')}
          >
            Зарегистрироваться
          </motion.button>
        </motion.div>
      </motion.section>

      <motion.section
        id="contacts"
        className={styles.contacts}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        <div className={styles.container}>
          <motion.h3 className={styles.contactsHeader} variants={fadeInUp}>
            Связаться с нами
          </motion.h3>
          <motion.p className={styles.contactsSubHeader} variants={fadeInUp}>
            Мы всегда рады обратной связи!
            <br /> Поделись идеями, сообщи о багах или просто расскажи, как тебе
            наша платформа.
          </motion.p>
          <motion.div
            className={styles.contactsWrapper}
            variants={staggerContainer}
          >
            <motion.div
              className={styles.contactsItem}
              variants={scaleIn}
              whileHover={{
                scale: 1.05,
                y: -5,
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                transition: { duration: 0.3 },
              }}
              onClick={() =>
                (window.location.href = 'mailto:tower.empire2021@gmail.com')
              }
              style={{ cursor: 'pointer' }}
            >
              <motion.img
                src="/img/social/email.svg"
                alt="email"
                className={styles.contactsItemImg}
                whileHover={{ scale: 1.1, rotate: 5 }}
              />
              <p className={styles.contactsItemHeader}>Электронная почта</p>
              <p className={styles.contactsItemText}>
                <u className={styles.contactsItemText}>
                  tower.empire2021@gmail.com
                </u>{' '}
                <br /> Для вопросов, предложений и поддержки
              </p>
              <p className={styles.contactsItemLink}>
                tower.empire2021@gmail.com
              </p>
            </motion.div>

            <motion.div
              className={styles.contactsItem}
              variants={scaleIn}
              whileHover={{
                scale: 1.05,
                y: -5,
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                transition: { duration: 0.3 },
              }}
              onClick={() => window.open('https://t.me/tower_empire', '_blank')}
              style={{ cursor: 'pointer' }}
            >
              <motion.img
                src="/img/social/telegram.svg"
                alt="telegram"
                className={styles.contactsItemImg}
                whileHover={{ scale: 1.1, rotate: 5 }}
              />
              <p className={styles.contactsItemHeader}>Телеграм</p>
              <p className={styles.contactsItemText}>
                Быстрые ответы и новости проекта
              </p>
              <p className={styles.contactsItemLink}>@tower_empire</p>
            </motion.div>

            <motion.div
              className={styles.contactsItem}
              variants={scaleIn}
              whileHover={{
                scale: 1.05,
                y: -5,
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                transition: { duration: 0.3 },
              }}
              onClick={() =>
                window.open('https://boosty.to/towerdragon', '_blank')
              }
              style={{ cursor: 'pointer' }}
            >
              <motion.img
                src="/img/social/boosty.svg"
                alt="boosty"
                className={styles.contactsItemImg}
                whileHover={{ scale: 1.1, rotate: 5 }}
              />
              <p className={styles.contactsItemHeader}>Поддержать проект</p>
              <p className={styles.contactsItemText}>
                Помоги развитию платформы
              </p>
              <p className={styles.contactsItemLink}>
                https://boosty.to/towerdragon
              </p>
            </motion.div>

            <motion.div
              className={styles.contactsItem}
              variants={scaleIn}
              whileHover={{
                scale: 1.05,
                y: -5,
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                transition: { duration: 0.3 },
              }}
              onClick={() =>
                window.open('https://discord.com/invite/bYjdJsK5ZH', '_blank')
              }
              style={{ cursor: 'pointer' }}
            >
              <motion.img
                src="/img/social/discord.svg"
                alt="discord"
                className={styles.contactsItemImg}
                whileHover={{ scale: 1.1, rotate: 5 }}
              />
              <p className={styles.contactsItemHeader}>Discord</p>
              <p className={styles.contactsItemText}>Здесь мы играем!</p>
              <p className={styles.contactsItemLink}>
                https://discord.com/invite/bYjdJsK5ZH
              </p>
            </motion.div>

            <motion.div
              className={styles.contactsItem}
              variants={scaleIn}
              whileHover={{
                scale: 1.05,
                y: -5,
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                transition: { duration: 0.3 },
              }}
              onClick={() => window.open('https://x.com/', '_blank')}
              style={{ cursor: 'pointer' }}
            >
              <motion.img
                src="/img/social/twitterX.svg"
                alt="TwitterX"
                className={styles.contactsItemImg}
                whileHover={{ scale: 1.1, rotate: 5 }}
              />
              <p className={styles.contactsItemHeader}>Twitter X</p>
              <p className={styles.contactsItemText}>
                Новости проекта и яркие игровые моменты
              </p>
              <p className={styles.contactsItemLink}>@tower_empire</p>
            </motion.div>

            <motion.div
              className={styles.contactsItem}
              variants={scaleIn}
              whileHover={{
                scale: 1.05,
                y: -5,
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                transition: { duration: 0.3 },
              }}
              onClick={() =>
                window.open('https://vk.com/towerempire', '_blank')
              }
              style={{ cursor: 'pointer' }}
            >
              <motion.img
                src="/img/social/VK.svg"
                alt="VK"
                className={styles.contactsItemImg}
                whileHover={{ scale: 1.1, rotate: 5 }}
              />
              <p className={styles.contactsItemHeader}>ВКонтакте</p>
              <p className={styles.contactsItemText}>
                Оставайся в курсе последних событий проекта
              </p>
              <p className={styles.contactsItemLink}>
                https://vk.com/towerempire
              </p>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        id="contacts"
        className={styles.join}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
        variants={staggerContainer}
      >
        <div className={styles.container}>
          <motion.h3 className={styles.joinHeader} variants={fadeInUp}>
            Присоединяйся к сообществу
          </motion.h3>
          <motion.p className={styles.joinSubHeader} variants={fadeInUp}>
            Следи за новостями и участвуй в обсуждениях. <br /> Наше сообщество
            — это место, где любители настольных игр находят друзей и делятся
            опытом.
          </motion.p>
          <motion.div
            className={styles.joinWrapper}
            variants={staggerContainer}
          >
            <motion.button
              onClick={() => window.open('https://t.me/tower_empire', '_blank')}
              className={styles.joinButtonTg}
              variants={scaleIn}
              whileHover={{
                scale: 1.05,
                boxShadow: '0 0 16px rgba(78, 181, 181, 0.55)',
              }}
              whileTap={{ scale: 0.95 }}
            >
              Телеграм канал
            </motion.button>
            <motion.button
              onClick={() =>
                window.open('https://discord.com/invite/bYjdJsK5ZH', '_blank')
              }
              className={styles.joinButtonDiscord}
              variants={scaleIn}
              whileHover={{
                scale: 1.05,
                boxShadow: '0 0 16px rgba(78, 181, 181, 0.55)',
              }}
              whileTap={{ scale: 0.95 }}
            >
              Discord сервер
            </motion.button>
          </motion.div>
          <motion.div
            className={styles.joinDevider}
            variants={fadeInUp}
          ></motion.div>
        </div>
      </motion.section>

      <motion.footer
        className={styles.footer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
      >
        <div className={styles.container}>
          <motion.div variants={fadeInUp}>
            <AnimatedDiceD20 />
          </motion.div>
          <motion.p className={styles.footerText} variants={fadeInUp}>
            © 2024-2026 Tower Empire
          </motion.p>
        </div>
      </motion.footer>

      {showScrollButton && (
        <motion.div
          className={styles.pageup}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          onClick={() => {
            // Функция для поиска скроллируемого элемента
            const scrollToTop = () => {
              // Попробуем найти SimpleBar элементы в разных вариантах
              const selectors = [
                '.main-scrollbar .simplebar-content-wrapper',
                '.simplebar-content-wrapper',
                '.main-scrollbar',
                '.simplebar-scroll-content',
                'main .simplebar-content-wrapper',
              ];

              for (const selector of selectors) {
                const element = document.querySelector(selector);
                if (element) {
                  element.scrollTo({
                    top: 0,
                    behavior: 'smooth',
                  });
                  return true;
                }
              }

              // Если ничего не найдено, используем window
              window.scrollTo({
                top: 0,
                behavior: 'smooth',
              });
              return false;
            };

            scrollToTop();
          }}
          aria-label="Scroll to up"
        >
          <img src="img/Up.svg" alt="up" />
        </motion.div>
      )}

      <ModalAboutUs
        isOpen={showAboutUs}
        onClose={() => setShowAboutUs(false)}
      />
    </div>
  );
};
