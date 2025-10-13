import { useMemo } from 'react';
import CalculatorLayout from '../components/CalculatorLayout.jsx';
import CalculatorDescription from '../components/CalculatorDescription.jsx';
import FormattedNumberInput from '../components/FormattedNumberInput.jsx';
import SliderInput from '../components/SliderInput.jsx';
import CalculatorOutput from '../components/CalculatorOutput.jsx';

function PriceToFcfCalculator({ inputs, onInputChange, onReset }) {
  const inputsJsx = (
    <>
      <h3>Inputs</h3>
      <FormattedNumberInput
        label="Free Cash Flow (FCF)"
        value={inputs.fcf}
        decimalPlaces={0}
        tooltipText="The company's most recent annual Free Cash Flow."
        onChange={(e) => onInputChange({ fcf: e.target.value })}
      />
      <SliderInput
        label="Expected % Increase/Decrease in FCF"
        value={inputs.fcfChange}
        min="-50"
        max="50"
        step="1"
        tooltipText="Adjust to see how a change in FCF affects the target price."
        onChange={(e) => onInputChange({ fcfChange: e.target.value })}
      />
      <FormattedNumberInput
        label="Price/FCF Multiple"
        value={inputs.fcfMultiple}
        decimalPlaces={0}
        tooltipText="The desired Price to FCF multiple you want to apply."
        onChange={(e) => onInputChange({ fcfMultiple: e.target.value })}
      />
      <FormattedNumberInput
        label="Shares Outstanding"
        value={inputs.sharesOutstanding}
        decimalPlaces={0}
        tooltipText="The total number of a company's outstanding shares."
        onChange={(e) => onInputChange({ sharesOutstanding: e.target.value })}
      />
      <FormattedNumberInput
        label="Current Stock Price"
        value={inputs.currentPrice}
        decimalPlaces={2}
        onChange={(e) => onInputChange({ currentPrice: e.target.value })}
      />
    </>
  );

  const { targetBuyPrice, difference } = useMemo(() => {
    const numFcf = parseFloat(inputs.fcf);
    const numFcfChange = parseFloat(inputs.fcfChange) / 100;
    const numFcfMultiple = parseFloat(inputs.fcfMultiple);
    const numShares = parseFloat(inputs.sharesOutstanding);
    const numCurrentPrice = parseFloat(inputs.currentPrice);

    if (isNaN(numFcf) || isNaN(numFcfChange) || isNaN(numFcfMultiple) || isNaN(numShares) || numShares <= 0) {
      return { targetBuyPrice: null, difference: null };
    }

    const adjustedFcf = numFcf * (1 + numFcfChange);
    const targetMarketCap = adjustedFcf * numFcfMultiple;
    const calculatedTargetPrice = targetMarketCap / numShares;

    if (isNaN(numCurrentPrice) || numCurrentPrice <= 0) {
      return { targetBuyPrice: calculatedTargetPrice, difference: null };
    }

    const calculatedDifference = ((calculatedTargetPrice - numCurrentPrice) / calculatedTargetPrice) * 100;
    return { targetBuyPrice: calculatedTargetPrice, difference: calculatedDifference };
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
      {targetBuyPrice !== null ? (
        <CalculatorOutput
          title="Target Buy Price"
          value={targetBuyPrice}
          difference={difference}
          getDifferenceColor={getDifferenceColor}
        />
      ) : (
        <p>Please enter all required inputs to see the calculated target price.</p>
      )}
    </>
  );

  return (
    <>
      <CalculatorDescription>
        <p>
          This Price to Free Cash Flow (FCF) calculator allows you to enter a value for Free Cash Flow and adjust a percentage increase/decrease in this amount before applying a Price/FCF multiple to return a target buy price.
        </p>
        <p>
          <strong>Formula:</strong> (FCF * P/FCF multiple) / Shares Outstanding
        </p>
      </CalculatorDescription>
      <CalculatorLayout inputs={inputsJsx} outputs={outputs} />
    </>
  );
}

export default PriceToFcfCalculator;
