import './NumberInput.css';

const formatNumber = (value, decimalPlaces) => {
  if (value === '' || value === null || value === undefined || value === '-') return value;
  const number = parseFloat(value);
  if (isNaN(number)) return '';

  if (decimalPlaces !== undefined) {
    return number.toLocaleString('en-US', { minimumFractionDigits: decimalPlaces, maximumFractionDigits: decimalPlaces });
  }
  return number.toLocaleString('en-US', { maximumFractionDigits: 20 });
};

const parseNumber = (value) => {
  return value.replace(/,/g, '');
};

function FormattedNumberInput({ label, description, value, onChange, placeholder, tooltipText, step = '1', disabled, decimalPlaces }) {
  const handleChange = (e) => {
    const rawValue = parseNumber(e.target.value);
    // Allow only numbers, a single decimal point, and a leading minus sign
    if (/^-?\d*\.?\d*$/.test(rawValue) || rawValue === '') {
      onChange({ target: { value: rawValue } });
    }
  };

  const handleBlur = (e) => {
    const rawValue = parseNumber(e.target.value);
    const number = parseFloat(rawValue);
    if (rawValue !== '' && !isNaN(number)) {
      if (decimalPlaces !== undefined) {
        onChange({ target: { value: number.toFixed(decimalPlaces) } });
      } else {
        onChange({ target: { value: number.toString() } });
      }
    }
  };

  const handleStep = (direction) => {
    const currentValue = parseFloat(parseNumber(value)) || 0;
    const stepValue = parseFloat(step);
    if (!isNaN(stepValue)) {
      onChange({ target: { value: (currentValue + direction * stepValue).toString() } });
    }
  };

  return (
    <div className={`input-group ${disabled ? 'disabled' : ''}`}>
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
      <div className="input-wrapper">
        <input
          type="text"
          inputMode="decimal"
          className="number-input"
          value={document.activeElement?.value === value ? value : formatNumber(value, document.activeElement?.className.includes('number-input') ? undefined : decimalPlaces)}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder || '0'}
          disabled={disabled}
        />
        {!disabled && (
          <div className="stepper">
            <button type="button" className="stepper-btn" onClick={() => handleStep(1)} tabIndex="-1">▲</button>
            <button type="button" className="stepper-btn" onClick={() => handleStep(-1)} tabIndex="-1">▼</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default FormattedNumberInput;