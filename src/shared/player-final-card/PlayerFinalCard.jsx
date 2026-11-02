import { PlayerFinalCardUI } from './ui/PlayerFinalCardUI';

export const PlayerFinalCard = ({ player, position, isWinner }) => {
  return (
    <PlayerFinalCardUI
      position={position}
      name={player.username ?? player.name}
      points={player.points}
      isWinner={isWinner}
    />
  );
};
