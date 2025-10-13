import { useMemo } from 'react';
import CalculatorLayout from '../components/CalculatorLayout.jsx';
import NumberInput from '../components/NumberInput.jsx';
import CalculatorDescription from '../components/CalculatorDescription.jsx';
import FormattedNumberInput from '../components/FormattedNumberInput.jsx';
import CalculatorOutput from '../components/CalculatorOutput.jsx';

function BenGrahamCalculator({ inputs, onInputChange, onReset }) {
  const inputsJsx = (
    <>
      <h3>Inputs</h3>
      <FormattedNumberInput
        label="Earnings Per Share (EPS)"
        value={inputs.eps}
        step="0.1"
        decimalPlaces={2}
        tooltipText="The trailing twelve months (TTM) earnings per share. This can be found on most financial websites."
        onChange={(e) => onInputChange({ eps: e.target.value })}
      />
      <FormattedNumberInput
        label="Expected EPS Growth Rate (%)"
        value={inputs.epsGrowthRate}
        step="0.1"
        decimalPlaces={1}
        tooltipText="The estimated growth rate for the next 7 to 10 years. This can be found in analyst reports."
        onChange={(e) => onInputChange({ epsGrowthRate: e.target.value })}
      />
      <FormattedNumberInput
        label="Average Yield of AAA Corporate Bonds (%)"
        description="Graham used 4.4% as the average."
        value={inputs.avgYield}
        tooltipText="The 20-year average yield of AAA-rated corporate bonds. 4.4% was the historical average during Graham's time."
        step="0.1"
        decimalPlaces={1}
        onChange={(e) => onInputChange({ avgYield: e.target.value })}
      />
      <FormattedNumberInput
        label="Current Yield on AAA Corporate Bonds (%)"
        value={inputs.currentYield}
        tooltipText="The current yield for high-grade corporate bonds. This can be found on financial market data websites."
        step="0.1"
        decimalPlaces={1}
        onChange={(e) => onInputChange({ currentYield: e.target.value })}
      />
      <FormattedNumberInput
        label="Current Stock Price"
        value={inputs.currentPrice}
        step="0.01"
        decimalPlaces={2}
        onChange={(e) => onInputChange({ currentPrice: e.target.value })}
      />
    </>
  );

  const { fairValue, difference } = useMemo(() => {
    const numEps = parseFloat(inputs.eps);
    const numEpsGrowthRate = parseFloat(inputs.epsGrowthRate);
    const numAvgYield = parseFloat(inputs.avgYield);
    const numCurrentYield = parseFloat(inputs.currentYield);
    const numCurrentPrice = parseFloat(inputs.currentPrice);

    if (isNaN(numEps) || isNaN(numEpsGrowthRate) || isNaN(numAvgYield) || isNaN(numCurrentYield) || numCurrentYield <= 0) {
      return { fairValue: null, difference: null };
    }

    const calculatedFairValue = (numEps * (8.5 + 2 * numEpsGrowthRate) * numAvgYield) / numCurrentYield;

    if (isNaN(numCurrentPrice) || numCurrentPrice <= 0) {
      return { fairValue: calculatedFairValue, difference: null };
    }

    const calculatedDifference = ((calculatedFairValue - numCurrentPrice) / calculatedFairValue) * 100;
    return { fairValue: calculatedFairValue, difference: calculatedDifference };
  }, [inputs]);

  const getDifferenceColor = (diff) => {
    if (diff === null) return '';
    if (diff < -30) return 'diff-red';
    if (diff < -10) return 'diff-amber';
    if (diff <= 0) return 'diff-light-green';
    if (diff > 0) return 'diff-strong-green';
    return '';
  };

  const outputs = (
    <>
      <h3>Results</h3>
      <button onClick={onReset} className="reset-button" style={{ width: '100%', marginBottom: '2rem' }}>
        Reset
      </button>
      {fairValue !== null ? (
        <CalculatorOutput
          title="Ben Graham Fair Value"
          value={fairValue}
          difference={difference}
          getDifferenceColor={getDifferenceColor}
        />
      ) : (
        <p>Please enter all required inputs to see the calculated fair value.</p>
      )}
    </>
  );

  return (
    <>
      <CalculatorDescription>
        <p>
          Proposed by investor and Columbia University professor Benjamin Graham, the "father of value investing", it was devised as a formula for lay investors to help with valuing growth stocks, while cautioning that the formula was not appropriate for companies with a "below-par" debt positions.
        </p>
        <p>
          <strong>Formula:</strong> Fair Value = (EPS * (8.5 + (2 * Expected EPS Growth Rate)) * Average Yield of AAA corporate bonds) / Current Yield on AAA corporate bonds
        </p>
      </CalculatorDescription>
      <CalculatorLayout inputs={inputsJsx} outputs={outputs} />
    </>
  );
}

export default BenGrahamCalculator;