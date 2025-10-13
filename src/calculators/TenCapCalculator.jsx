import { useMemo } from 'react';
import CalculatorLayout from '../components/CalculatorLayout.jsx';
import NumberInput from '../components/NumberInput.jsx';
import CalculatorDescription from '../components/CalculatorDescription.jsx';
import FormattedNumberInput from '../components/FormattedNumberInput.jsx';
import CalculatorOutput from '../components/CalculatorOutput.jsx';
import ToggleSwitch from '../components/ToggleSwitch.jsx';
import '../components/ClearButton.css';

function TenCapCalculator({ inputs, onInputChange, onReset }) {
  const handleToggle = () => {
    onInputChange({ useDirectMaintCapEx: !inputs.useDirectMaintCapEx });
  };

  const inputsJsx = (
    <>
      <div className="inputs-header">
        <h3>Inputs</h3>
        <button onClick={onReset} className="clear-button">
          Clear All Fields
        </button>
      </div>
      <FormattedNumberInput
        label="Net Income"
        value={inputs.netIncome}
        step="1"
        tooltipText="Found on the Income Statement."
        onChange={(e) => onInputChange({ netIncome: e.target.value })}
      />
      <FormattedNumberInput
        label="Depreciation & Amortisation"
        value={inputs.depreciation}
        step="1"
        tooltipText="Found on the Cash Flow Statement."
        onChange={(e) => onInputChange({ depreciation: e.target.value })}
      />
      <FormattedNumberInput
        label="Changes in Working Capital"
        value={inputs.workingCapital}
        step="1"
        tooltipText="Found on the Cash Flow Statement. A negative number should be entered with a minus sign."
        onChange={(e) => onInputChange({ workingCapital: e.target.value })}
      />

      <div className="input-group">
        <label className="input-label">Maintenance CapEx</label>
        <span className="input-description">Choose one method to enter Maintenance CapEx.</span>
        <ToggleSwitch
          isToggled={!inputs.useDirectMaintCapEx}
          onToggle={handleToggle}
          offLabel="Direct Input"
          onLabel="Calculate"
        />
        <div className="side-by-side-inputs">
          <div className={`input-container ${!inputs.useDirectMaintCapEx ? 'disabled' : ''}`}>
            <FormattedNumberInput
              label="Direct Amount"
              value={inputs.maintCapExDirect}
              step="1"
              tooltipText="The portion of Capital Expenditures used to maintain current operations. Often requires estimation."
              onChange={(e) => onInputChange({ maintCapExDirect: e.target.value })}
              disabled={!inputs.useDirectMaintCapEx}
            />
          </div>
          <div className={`input-container ${inputs.useDirectMaintCapEx ? 'disabled' : ''}`}>
            <FormattedNumberInput
              label="Total CapEx"
              value={inputs.totalCapEx}
              step="1"
              tooltipText="Total Capital Expenditures, found on the Cash Flow Statement."
              onChange={(e) => onInputChange({ totalCapEx: e.target.value })}
              disabled={inputs.useDirectMaintCapEx}
            />
            <FormattedNumberInput
              label="Maint. % of Total"
              value={inputs.maintCapExPercentage}
              step="1"
              decimalPlaces={0}
              tooltipText="The percentage of Total CapEx you estimate is for maintenance (vs. growth)."
              onChange={(e) => onInputChange({ maintCapExPercentage: e.target.value })}
              disabled={inputs.useDirectMaintCapEx}
            />
          </div>
        </div>
      </div>

      <FormattedNumberInput
        label="Market Cap"
        value={inputs.marketCap}
        step="1"
        tooltipText="The total value of all a company's shares of stock. Also known as Market Capitalization."
        onChange={(e) => onInputChange({ marketCap: e.target.value })}
      />
    </>
  );

  const { ownerEarnings, capRate } = useMemo(() => {
    const numNetIncome = parseFloat(inputs.netIncome);
    const numDepreciation = parseFloat(inputs.depreciation);
    const numWorkingCapital = parseFloat(inputs.workingCapital);
    const numMarketCap = parseFloat(inputs.marketCap);

    let maintCapEx = 0;
    if (inputs.useDirectMaintCapEx) {
      maintCapEx = parseFloat(inputs.maintCapExDirect);
    } else {
      const numTotalCapEx = parseFloat(inputs.totalCapEx);
      const numMaintPercentage = parseFloat(inputs.maintCapExPercentage) / 100;
      if (!isNaN(numTotalCapEx) && !isNaN(numMaintPercentage)) {
        maintCapEx = numTotalCapEx * numMaintPercentage;
      }
    }

    if (isNaN(numNetIncome) || isNaN(numDepreciation) || isNaN(numWorkingCapital) || isNaN(maintCapEx)) {
      return { ownerEarnings: null, capRate: null };
    }

    const calculatedOwnerEarnings = numNetIncome + numDepreciation + numWorkingCapital - maintCapEx;

    if (isNaN(numMarketCap) || numMarketCap <= 0) {
      return { ownerEarnings: calculatedOwnerEarnings, capRate: null };
    }

    const calculatedCapRate = (calculatedOwnerEarnings / numMarketCap) * 100;
    return { ownerEarnings: calculatedOwnerEarnings, capRate: calculatedCapRate };
  }, [inputs]);

  const getCapRateColor = (rate) => {
    if (rate === null) return '';
    return rate >= 10 ? 'diff-strong-green' : 'diff-amber';
  };

  const outputs = (
    <>
      <h3>Results</h3>
      {ownerEarnings !== null ? (
        <>
          <CalculatorOutput title="Owner Earnings" value={ownerEarnings} isInteger={true} />
          <div style={{ marginTop: '2rem' }}>
            {capRate !== null ? (
              <div className="output-group">
                <div className="output-main">
                  <span className="output-title">Ten Cap Rate</span>
                  <span
                    className="output-value"
                    style={{ color: `var(--${getCapRateColor(capRate).replace('diff-', '')}-color)` }}
                  >
                    {capRate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
                  </span>
                </div>
              </div>
            ) : (
              <p>Enter Market Cap to see Cap Rate.</p>
            )}
          </div>
        </>
      ) : (
        <p>Please enter all required inputs to see the calculated results.</p>
      )}
    </>
  );

  return (
    <>
      <CalculatorDescription>
        <p>The 'Ten Cap' stock valuation method was created by Phil Town and originated within real estate before being borrowed for the stock market. In real estate, the cap rate is calculated by dividing the annual net rental income by the purchase price of the property. This method can be useful for valuing more established businesses alongside other valuation methods, and aims for a 10% ('ten cap') or higher return on investment by comparing a company's owner earnings (a measure of cash flow) to its current market price.</p>
        <p><strong>Formula:</strong> Cap Rate = Owner Earnings / Current Market Price (or Market Cap)</p>
      </CalculatorDescription>
      <CalculatorLayout inputs={inputsJsx} outputs={outputs} />
    </>
  );
}

export default TenCapCalculator;