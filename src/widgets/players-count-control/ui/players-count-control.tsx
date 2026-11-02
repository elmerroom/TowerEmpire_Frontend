import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';

export type PlayersCountControlProps = {
  isHost: boolean;
  playersCount: number;
  maxPlayers: number;
  options?: number[];
  onChange: (value: number) => void;
  label?: string;
  className?: string;
  classes?: {
    select?: string;
    option?: string;
    players?: string;
    playersNum?: string;
  };
};

const defaultOptions = Array.from({ length: 12 - 3 + 1 }, (_, i) => i + 3);

export const PlayersCountControl: React.FC<PlayersCountControlProps> = ({
  isHost,
  playersCount,
  maxPlayers,
  options,
  onChange,
  label = 'Игроки',
  className = '',
  classes,
}) => {
  const values = options && options.length ? options : defaultOptions;
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={`d-flex align-items-center justify-content-center ${
        classes?.players ?? ''
      } ${className}`}
    >
      {label}&nbsp;
      <span
        className={`mb-0 ${classes?.playersNum ?? ''}`}
        style={isHost ? { position: 'relative', cursor: 'pointer' } : undefined}
      >
        {playersCount}/{maxPlayers}
        {isHost && (
          <FontAwesomeIcon
            icon={faChevronDown}
            style={{
              marginLeft: 4,
              fontSize: '0.7em',
              transition: 'transform 0.2s ease',
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          />
        )}
        {isHost && (
          <select
            value={maxPlayers}
            onChange={e => onChange(Number(e.target.value))}
            onFocus={() => setIsOpen(true)}
            onBlur={() => setIsOpen(false)}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity: 0,
              cursor: 'pointer',
            }}
          >
            {values.map(num => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        )}
      </span>
    </div>
  );
};
