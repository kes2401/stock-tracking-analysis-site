import './CalculatorOutput.css';

function CalculatorOutput({ title, value, difference = null, getDifferenceColor }) {
  const colorClass = getDifferenceColor ? getDifferenceColor(difference) : '';

  return (
    <div className="output-group">
      <div className="output-main">
        <span className="output-title">{title}</span>
        <span className="output-value">
          {value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>
      {difference !== null && (
        <div className="output-comparison">
          <span className={`difference-badge ${colorClass}`}>
            {difference > 0 ? '+' : ''}{difference.toFixed(1)}%
          </span>
          <span className="comparison-text">Margin of Safety</span>
        </div>
      )}
    </div>
  );
}

export default CalculatorOutput;