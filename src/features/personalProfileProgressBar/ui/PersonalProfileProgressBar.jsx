import styles from './PersonalProfileProgressBar.module.css';

export const PersonalProfileProgressBar = ({ completed }) => {
  const validCompleted = Math.min(Math.max(completed, 0), 100);
  const labelStyles = {
    padding: 5,
    color: 'white',
    fontWeight: 'bold',
    opacity: 0,
  };

  return (
    <div className="personal-profile__progressbar">
      <div
        className={styles.progressBar__line}
        style={{ width: `${validCompleted}%` }}
        role="progressbar"
        aria-valuenow={validCompleted}
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <div className="personal-profile__progressbar-rhomb">
          <svg width="24" height="24">
            <use href="#profile-rhomb"></use>
          </svg>
        </div>
        <div style={labelStyles}>{`${validCompleted}%`}</div>
      </div>
    </div>
  );
};
