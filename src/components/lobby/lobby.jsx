import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { openModal } from '../../store/modalSlice';
import { ModalPlayNoauth } from './modals/play_noauth';
import { ModalCreateRoom } from './modals/create_room';
import { LoginHeader } from './lobby_header';
import { ModalLogin } from './modals/login';
import { ModalAuth } from './modals/auth';
import { LockerSVG } from '../../shared/svg/lockerSvg';
import { PlaySvg } from '../../shared/svg/play';
import { setRedirected } from '../../entities/user/model/slice';
import { ModalSendEmailResetPassword } from './modals/send_reset_password';
import { useGetLobbiesQuery } from '../../store/api/lobbyApi';
import { ModalEnterLobbyPassword } from './modals/enter_password';
import { ModalInfo } from './modals/info-message';
import { setInfoMessage } from '@/store/slices/lobby/lobbyUiSlice';
import { useAddUser } from '../helpers/hooks/useAddUser';
import { LobbySkeletonRow } from './LobbySkeleton';
import { useToast } from '../helpers/toast_notification';
import { Button } from '../../shared/ui/Button';
import { Footer } from './footer/Footer';

export const Lobby = () => {
  const dispatch = useDispatch();
  const isAuth = useSelector(state => state.user.isAuth);
  const isRedirected = useSelector(state => state.user.isRedirected);
  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState('');
  const { showToast } = useToast();
  const { data = [], isLoading, refetch } = useGetLobbiesQuery();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (isRedirected) {
      console.log('REDIRECTED');
      dispatch(openModal('loginmodal'));
      dispatch(setRedirected(false));
    }
  }, [isRedirected]);
  // Обработка автоматического открытия регистрации
  useEffect(() => {
    const autoRegister = searchParams.get('autoRegister');
    if (autoRegister === 'true' && !isAuth) {
      // Небольшая задержка для корректной инициализации DOM
      setTimeout(() => {
        dispatch(openModal('authmodal'));
        // Очищаем параметр из URL
        searchParams.delete('autoRegister');
        setSearchParams(searchParams, { replace: true });
      }, 100);
    }
  }, [searchParams, setSearchParams, isAuth]);

  const handleRefresh = () => {
    refetch()
      .then(refetchResponse => {
        console.log('Data after refresh:', refetchResponse.data);
      })
      .catch(refetchError => {
        console.error('Error refreshing data:', refetchError);
      });
  };
  useEffect(() => {
    handleRefresh();
  }, []);

  // Удаление модалок и остаточных элкментов
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

  //isMobile
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div>
      <ModalPlayNoauth></ModalPlayNoauth>
      <ModalLogin></ModalLogin>
      <ModalAuth></ModalAuth>
      <ModalCreateRoom></ModalCreateRoom>
      <ModalSendEmailResetPassword></ModalSendEmailResetPassword>
      <ModalEnterLobbyPassword></ModalEnterLobbyPassword>
      <ModalInfo info={error}></ModalInfo>
      <div className="container container_lobby container_lines">
        <img
          src="./img/border-decor.svg"
          className="border-decor border-decor_left"
          alt="BorderDecor"
        />
        <img
          src="./img/border-decor.svg"
          className="border-decor border-decor_right"
          alt="BorderDecor"
        />
        <LoginHeader></LoginHeader>
        <h3 className="title-blue title-lobby">Список комнат</h3>
        <div className="lobby__btn-wrapper">
          <div className="lobby__btn-subwrapper">
            <Button
              variant="lobby"
              className="btn-lobby__create-room"
              onClick={() => dispatch(openModal('createRoom'))}
            >
              <svg aria-hidden="true" focusable="false" width="25" height="25">
                <use href="#plus"></use>
              </svg>
              Создать комнату
            </Button>

            <Button variant="lobby" className="refresh" onClick={handleRefresh}>
              Обновить
            </Button>
          </div>
          <div className="lobby__btn-subwrapper">
            <Button variant="ashy">
              <p> Все</p>
            </Button>
            <Button variant="ashy">
              <p>100 черных острот</p>
            </Button>
          </div>
        </div>
        <div className="table-container">
          <table className="table table-lobby">
            <thead className="table-lobby_thead">
              <tr>
                <th scope="col" className="mobile-none  tablet-none">
                  #
                </th>
                <th scope="col"></th>
                <th scope="col">Название</th>
                <th scope="col" className="mobile-none">
                  Создатель
                </th>
                <th scope="col">Игроки</th>
                <th scope="col">Игра</th>
                <th scope="col">
                  {isMobile ? 'Вход' : 'При\u00ADсое\u00ADди\u00ADнить\u00ADся'}
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? // показываем, например, 5 строк-скелетонов, чтобы заполнить «зону»
                  Array.from({ length: 25 }).map((_, idx) => (
                    <LobbySkeletonRow key={idx} />
                  ))
                : data.map((room, index) => {
                    const handleRoomClick = () => {
                      if (room.players.length === room.max_players) {
                        showToast(
                          'Комната заполнена, вы не можете присоединиться!',
                        );
                      } else if (!isAuth) {
                        dispatch(
                          openModal({
                            id: 'play-no_auth',
                            data: { roomId: room.id },
                          }),
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
                    const hostPlayer =
                      room.host ||
                      room.players?.find(
                        player =>
                          player?.is_host === true || player?.isHost === true,
                      );
                    const hostName =
                      hostPlayer?.username || hostPlayer?.name || '';
                    const hostNicknameColor =
                      hostPlayer?.nickname_color ||
                      hostPlayer?.nicknameColor ||
                      '#4eb5b5';

                    return (
                      <tr key={room.id}>
                        <td scope="row" className="mobile-none  tablet-none">
                          {index + 1}
                        </td>
                        <td>{room.is_private && <LockerSVG></LockerSVG>}</td>
                        <td className="table-lobby__name text-color-blue">
                          {room.title}
                        </td>
                        <td
                          className="table-lobby__nickName mobile-none"
                          style={
                            hostName ? { color: hostNicknameColor } : undefined
                          }
                        >
                          {hostName}
                        </td>
                        <td
                          className={
                            room.players.length === room.max_players
                              ? 'table-lobby__numPlayers'
                              : ''
                          }
                        >
                          {room.players.length}/{room.max_players}
                        </td>
                        <td>{room.game_name}</td>
                        <td>
                          <Button
                            className="btn-play-table mobile-none"
                            data-room-id={room.id}
                            onClick={handleRoomClick}
                          >
                            Играть
                          </Button>
                          <div
                            className="play_button-lobby"
                            data-room-id={room.id}
                            onClick={handleRoomClick}
                          >
                            <PlaySvg></PlaySvg>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>
        <Footer />
      </div>
      {/* <Footer /> */}
    </div>
  );
};
