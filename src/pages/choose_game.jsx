import { useSelector } from 'react-redux';
import { useChannel } from '@/websocket/hooks/useChannel';
import { selectCurrentLobby } from '../store/slices/lobby/currentLobbySlice';
import { ModalGameDescription } from '../features/game-description/index';
import { Header } from '../components/choose_game/choose_header';
import { ChoosePlayers } from '../components/choose_game/choose_players/index';
import { GameSelection } from '@/widgets/game-selection';
import { ModalSettings } from '../components/helpers/modals/modal_settings';
import { ModalKickLobby } from '../components/helpers/modals/modal_kick_warning1';
import { ModalPromotion } from '../components/helpers/modals/modal_promotion';
import { ModalInvitation } from '../components/helpers/modals/modal_invitation';
import { ModalExit } from '../components/helpers/modals/modal_exit';
import { RoomDeletedModal } from '../components/lobby/modals/RoomDeletedModal';
import styles from './choose_game.module.scss';
import { Chat } from '@/features/chat/chat';

export const ChooseGame = () => {
  useChannel('lobby'); // ← только включает/выключает хендлеры lobby
  // 1) Пытаемся взять из стора
  const lobbyData = useSelector(selectCurrentLobby);

  return (
    <div>
      <>
        {/* <ModalInfo info={error} /> */}
        <ModalPromotion></ModalPromotion>
        <ModalInvitation></ModalInvitation>
        <ModalKickLobby />
        <RoomDeletedModal />
        <ModalGameDescription />
        <ModalSettings></ModalSettings>
        <ModalExit></ModalExit>
        <div className={`container ${styles.container}`}>
          <Header></Header>
          <div className={styles.roomName}>
            Комната:
            <span className="text-color-blue"> {lobbyData?.title} </span>
          </div>
          <div className={`row align-items-stretch ${styles.grid}`}>
            <ChoosePlayers />
            <GameSelection />
            <Chat type="ROOM"></Chat>
          </div>
        </div>
      </>
    </div>
  );
};
