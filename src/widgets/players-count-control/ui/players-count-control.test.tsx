import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PlayersCountControl } from './players-count-control';

describe('PlayersCountControl', () => {
  it('renders select for host with valid options and handles change', () => {
    const onChange = vi.fn();
    render(
      <PlayersCountControl
        isHost={true}
        playersCount={4}
        maxPlayers={6}
        onChange={onChange}
        options={[3, 4, 5, 6, 7]}
        classes={{ option: 'opt' }}
      />,
    );

    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select).toBeTruthy();

    const options = screen.getAllByRole('option');
    expect(options.length).toBe(5);
    expect(options.some(o => o.textContent === '6')).toBe(true);
    expect(select.value).toBe('6');

    fireEvent.change(select, { target: { value: '7' } });
    expect(onChange).toHaveBeenCalledWith(7);

    const container = select.parentElement as HTMLElement;
    expect(container.querySelector('option span')).toBeNull();
  });

  it('renders indicator for non-host', () => {
    render(
      <PlayersCountControl
        isHost={false}
        playersCount={5}
        maxPlayers={8}
        onChange={() => {}}
        classes={{ players: 'players', playersNum: 'playersNum' }}
      />,
    );

    expect(screen.queryByRole('combobox')).toBeNull();
    expect(!!screen.getByText(/Игроки/)).toBe(true);
    expect(!!screen.getByText('5/8')).toBe(true);
  });
});
