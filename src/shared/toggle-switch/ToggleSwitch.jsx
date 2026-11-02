import PropTypes from 'prop-types';
import styles from './ToggleSwitch.module.scss';

export const ToggleSwitch = ({
  id,
  checked,
  onChange,
  disabled = false,
  className = '',
  size = 'md', // 'sm' | 'md' | 'lg'
  activeThumb = '#4EB5B5',
  inactiveThumb = '#223C4B',
  activeBg = '#223C4B',
  inactiveBg = '#11212A',
  activeLabel = 'Вкл',
  inactiveLabel = 'Выкл',
}) => {
  const handleChange = () => {
    if (disabled) return;
    onChange?.(!checked);
  };

  const sizeClass =
    size === 'sm' ? styles.sm : size === 'lg' ? styles.lg : undefined;

  return (
    <div
      className={[styles.root, sizeClass, className].filter(Boolean).join(' ')}
      style={{
        // все цвета можно переопределять снаружи
        '--active-thumb': activeThumb,
        '--inactive-thumb': inactiveThumb,
        '--active-bg': activeBg,
        '--inactive-bg': inactiveBg,
      }}
    >
      <input
        id={id}
        type="checkbox"
        className={styles.checkbox}
        checked={checked}
        disabled={disabled}
        onChange={handleChange}
      />
      <label className={styles.label} htmlFor={id}>
        <span className={styles.inner}>
          <span className={`${styles.text} ${styles['text--on']}`}>
            {activeLabel}
          </span>
          <span className={`${styles.text} ${styles['text--off']}`}>
            {inactiveLabel}
          </span>
        </span>
        <span className={styles.thumb} />
      </label>
    </div>
  );
};

ToggleSwitch.propTypes = {
  id: PropTypes.string.isRequired,
  checked: PropTypes.bool,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  activeThumb: PropTypes.string,
  inactiveThumb: PropTypes.string,
  activeBg: PropTypes.string,
  inactiveBg: PropTypes.string,
  activeLabel: PropTypes.string,
  inactiveLabel: PropTypes.string,
};
