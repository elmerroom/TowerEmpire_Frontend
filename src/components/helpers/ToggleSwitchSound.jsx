export const ToggleSwitchSound = ({
  checked = false,
  onChange,
  id = 'toggle-switch',
}) => {
  const handleChange = () => {
    if (onChange) {
      onChange(!checked);
    }
  };

  return (
    <div className={`toggle-switch toggle-switch__gameMode`}>
      <input
        type="checkbox"
        className="toggle-switch-checkbox"
        checked={checked}
        onChange={handleChange}
        id={id}
      />
      <label className="toggle-switch-label" htmlFor={id}>
        <span className="toggle-switch-inner toggle-switch-inner__gameMode"></span>
        <span className="toggle-switch-switch toggle-switch-switch__gameMode"></span>
      </label>
    </div>
  );
};
