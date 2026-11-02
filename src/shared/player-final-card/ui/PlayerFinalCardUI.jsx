export const PlayerFinalCardUI = ({ position, name, points, isWinner }) => {
  const safeName = typeof name === 'string' ? name : '';
  const avatarLetter = safeName?.charAt(0)?.toUpperCase() || '?';
  return (
    <li className="player-card">
      {isWinner ? (
        <img className="player-card_trophy" src="/img/trophy.svg" alt="" />
      ) : (
        <p className="player-card_trophy">{position}. </p>
      )}
      <div className="player-card_avatar">{avatarLetter}</div>
      <p className="player-card_nick">{safeName}</p>
      <p className="player-card_score">{points}</p>
    </li>
  );
};
