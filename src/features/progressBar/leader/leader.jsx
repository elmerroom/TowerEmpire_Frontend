import { memo } from 'react';
import { useSelector } from 'react-redux';
import { selectMasterId } from '@/entities/game/model/gameBjSlice';
import { selectGamePlayerById } from '@/entities/player/model/gamePlayerSlice';

export const Leader = memo(({ className }) => {
  const masterId = useSelector(selectMasterId);
  const masterPlayer = useSelector(state =>
    masterId != null ? selectGamePlayerById(state, masterId) : null,
  );
  const masterPlayerName = masterPlayer?.name || 'Не выбран';

  return (
    <div
      className={`${className}__leader ${masterPlayerName === 'Не выбран' ? `${className}__leader--hide` : ''}`}
    >
      <h6> Ведущий:&nbsp; </h6>
      <p> {masterPlayerName} </p>
    </div>
  );
});

Leader.displayName = 'Leader';
