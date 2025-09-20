import './NumberInput.css';

const formatNumber = (value) => {
  if (value === '' || value === null || value === undefined || value === '-') return value;
  const number = parseFloat(value);
  if (isNaN(number)) return '';
  return number.toLocaleString('en-US');
};

const parseNumber = (value) => {
  return value.replace(/,/g, '');
};

function FormattedNumberInput({ label, description, value, onChange, placeholder, tooltipText, step, disabled }) {
  const handleChange = (e) => {
    const rawValue = parseNumber(e.target.value);
    // Allow only numbers, a single decimal point, and a leading minus sign
    if (/^-?\d*\.?\d*$/.test(rawValue) || rawValue === '') {
      onChange({ target: { value: rawValue } });
    }
  };

  const handleBlur = (e) => {
    const rawValue = parseNumber(e.target.value);
    if (rawValue !== '' && !isNaN(parseFloat(rawValue))) {
      onChange({ target: { value: parseFloat(rawValue).toString() } });
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
      <input
        type="text"
        inputMode="decimal"
        className="number-input"
        value={formatNumber(value)}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder || '0'}
        disabled={disabled}
      />
    </div>
  );
}

export default FormattedNumberInput;