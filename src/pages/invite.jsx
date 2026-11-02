import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { openModal } from '../store/modalSlice';
import { ModalPlayNoauth } from '../components/lobby/modals/play_noauth';
import { ModalLogin } from '../components/lobby/modals/login';
import { ModalAuth } from '../components/lobby/modals/auth';
import { ModalSendEmailResetPassword } from '../components/lobby/modals/send_reset_password';
import { useGetLobbiesQuery } from '../store/api/lobbyApi';
import { ModalEnterLobbyPassword } from '../components/lobby/modals/enter_password';
import { ModalInfo } from '../components/lobby/modals/info-message';
import { setInfoMessage } from '../store/slices/lobby/lobbyUiSlice';
import { useAddUser } from '../components/helpers/hooks/useAddUser';
import { Helmet } from 'react-helmet-async';
import { ModalSVG } from '../shared/svg/modal_svg';
import { Button } from '../shared/ui/Button';

export const InvitePage = () => {
  const dispatch = useDispatch();
  const isAuth = useSelector(state => state.user.isAuth);
  const [error, setError] = useState('');
  const { data = [], isLoading, error: fetchError } = useGetLobbiesQuery();

  const { id } = useParams();
  const navigate = useNavigate();
  const [roomInfo, setRoomInfo] = useState(null);
  const [roomExists, setRoomExists] = useState(true);

  // Проверка существования и поиск лобби по ID для пригласительной ссылки
  useEffect(() => {
    if (data && data.length > 0) {
      const room = data.find(room => room.id === parseInt(id));
      if (room) {
        setRoomInfo(room);
        setRoomExists(true);
      } else {
        // Лобби не найдено
        setRoomExists(false);
        // Редирект на 404
        navigate('/not-found', { replace: true });
      }
    } else if (!isLoading && !fetchError) {
      // Данные загрузились, но лобби нет
      setRoomExists(false);
      navigate('/not-found', { replace: true });
    } else if (fetchError) {
      // Ошибка при загрузке данных
      setRoomExists(false);
      navigate('/not-found', { replace: true });
    }
  }, [data, id, isLoading, fetchError, navigate]);

  // Очистка модалок при размонтировании
  // useEffect(() => {
  //   const cleanup = () => {
  //     document.querySelectorAll('.modal').forEach(modal => {
  //       const instance = Modal.getInstance(modal);
  //       if (instance) {
  //         instance.hide();
  //         instance.dispose();
  //       }
  //       modal.style.display = 'none';
  //     });
  //     document
  //       .querySelectorAll('.modal-backdrop')
  //       .forEach(backdrop => backdrop.remove());
  //     document.body.classList.remove('modal-open');
  //   };

  //   // Очистка при размонтировании
  //   return cleanup;
  // }, []);

  const AddUser = useAddUser();

  const handleEnterLobby = async id => {
    try {
      await AddUser({
        id: id,
        password: '',
      });
    } catch (error) {
      dispatch(
        setInfoMessage({
          isSuccess: false,
          message: error.message,
        }),
      );
      dispatch(openModal('info-modal'));
    }
  };

  // Мета-данные для SEO при открытии пригласительной ссылки
  const title = 'Tower-empire';
  const description = roomInfo
    ? `Вы приглашены в комнату "${roomInfo.title || 'Без названия'}". Присоединяйтесь к игре!`
    : 'Вы получили приглашение в игру. Чтобы присоединиться, нажмите на кнопку.';
  const imageUrl = `${window.location.origin}/img/logo.svg`;

  // Если лобби не существует, то не рендерим ничего
  if (!roomExists) {
    return null;
  }

  return (
    <div>
      {/* Мета-теги для улучшения отображения ссылки в мессенджерах и соцсетях */}
      <Helmet>
        {/* Основные мета-теги */}
        <title>{title}</title>
        <meta name="description" content={description} />

        {/* Open Graph мета-теги для Facebook, VK и других платформ */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={imageUrl} />

        {/* Card мета-теги */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={window.location.href} />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={imageUrl} />
      </Helmet>

      <ModalPlayNoauth></ModalPlayNoauth>
      <ModalLogin></ModalLogin>
      <ModalAuth></ModalAuth>
      <ModalSendEmailResetPassword></ModalSendEmailResetPassword>
      <ModalEnterLobbyPassword></ModalEnterLobbyPassword>
      <ModalInfo info={error}></ModalInfo>
      <div className="container container_lobby container_lines">
        <img
          src="/img/border-decor.svg"
          className="border-decor border-decor_left"
          alt="BorderDecor"
        />
        <img
          src="/img/border-decor.svg"
          className="border-decor border-decor_right"
          alt="BorderDecor"
        />

        {data
          .filter(room => room.id === parseInt(id))
          .map(room => {
            const handleRoomClick = () => {
              if (!isAuth) {
                dispatch(
                  openModal({ id: 'play-no_auth', data: { roomId: room.id } }),
                );
              } else if (isAuth && room.is_private) {
                dispatch(
                  openModal({
                    id: 'play-enter_password',
                    data: { roomId: room.id },
                  }),
                );
              } else {
                handleEnterLobby(room.id);
              }
            };
            return (
              <div
                key={room.id}
                className="d-flex flex-column align-items-center justify-content-center"
                style={{ minHeight: '80vh' }}
              >
                <img
                  src="/img/cat.png"
                  alt="Cat"
                  className="mb-4"
                  style={{ maxWidth: '150px' }}
                />
                <h1 className="title-blue mb-4">Приглашение в комнату</h1>
                <ModalSVG></ModalSVG>
                <p className="text-center mb-4">
                  Вы получили приглашение в игру. Чтобы присоединиться, нажмите
                  кнопку ниже.
                </p>
                <div className="d-flex gap-3">
                  <Button
                    variant="lobby"
                    className="btn-lobby__create-room btn-invite-page"
                    disabled={room.players.length === room.max_players}
                    data-room-id={room.id}
                    onClick={handleRoomClick}
                  >
                    Войти в комнату
                  </Button>

                  <Button
                    variant="lobby"
                    className="btn-lobby__create-room btn-invite-page mb-3"
                    onClick={() => navigate('/')}
                  >
                    На главную
                  </Button>
                </div>
                {room.players.length === room.max_players && (
                  <span className="error-input fs-5 text-center">
                    Комната заполнена, вы не можете присоединиться!
                  </span>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
};
