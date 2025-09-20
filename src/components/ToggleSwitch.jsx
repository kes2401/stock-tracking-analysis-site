import './ToggleSwitch.css';

function ToggleSwitch({ isToggled, onToggle, offLabel, onLabel }) {
  return (
    <div className="toggle-switch-container">
      <span>{offLabel}</span>
      <label className="toggle-switch">
        <input type="checkbox" checked={isToggled} onChange={onToggle} />
        <span className="slider"></span>
      </label>
      <span>{onLabel}</span>
    </div>
  );
}

export default ToggleSwitch;