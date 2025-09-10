import './NumberInput.css';

function NumberInput({ label, description, value, onChange, placeholder, tooltipText }) {
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
        {description && <span className="input-description">{description}</span>}
      </label>
      <input
        type="number"
        className="number-input"
        value={value}
        onChange={onChange}
        placeholder={placeholder || '0'}
      />
    </div>
  );
}

export default NumberInput;