import './SliderInput.css';

function SliderInput({ label, value, onChange, min, max, step, tooltipText }) {
  return (
    <div className="input-group">
      <label>
        <div className="label-container">
          <span className="input-label">{label}</span>
          {tooltipText && (
            <div className="tooltip-container">
              <span className="info-icon">ⓘ</span>
              <span className="tooltip-text">{tooltipText}</span>
            </div>
          )}
        </div>
      </label>
      <div className="slider-container">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={onChange}
          className="slider-input"
        />
        <span className="slider-value">{value}%</span>
      </div>
    </div>
  );
}

export default SliderInput;