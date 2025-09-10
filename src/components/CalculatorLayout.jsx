import './CalculatorLayout.css';

function CalculatorLayout({ inputs, outputs }) {
  return (
    <div className="calculator-layout">
      <div className="calculator-inputs">{inputs}</div>
      <div className="calculator-outputs">{outputs}</div>
    </div>
  );
}

export default CalculatorLayout;