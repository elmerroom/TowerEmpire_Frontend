export const Arrow = ({ direction, onClick }) => {
  return (
    <div className="arrow" onClick={onClick}>
      <svg style={{ height: '16px', width: '14px' }}>
        <use href={`#arrow_${direction}`} style={{ color: 'transparent' }} />
      </svg>
    </div>
  );
};
