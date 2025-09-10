import { useState, useMemo } from 'react';
import CalculatorLayout from '../components/CalculatorLayout.jsx';
import NumberInput from '../components/NumberInput.jsx';
import CalculatorDescription from '../components/CalculatorDescription.jsx';
import CalculatorOutput from '../components/CalculatorOutput.jsx';

function PeterLynchCalculator({ inputs, onInputChange }) {
  const inputsJsx = (
    <>
      <h3>Inputs</h3>
      <NumberInput
        label="Earnings Per Share (EPS)"
        description="Can be found on the income statement."
        value={inputs.eps}
        tooltipText="EPS is a company's profit divided by the outstanding shares of its common stock."
        step="0.01"
        onChange={(e) => onInputChange({ eps: e.target.value })}
      />
      <NumberInput
        label="EPS Growth Rate (%)"
        value={inputs.epsGrowthRate}
        tooltipText="The expected annual growth rate of the coming years."
        step="0.1"
        onChange={(e) => onInputChange({ epsGrowthRate: e.target.value })}
      />
      <NumberInput
        label="Price/Earnings to Growth (PEG) Ratio"
        value={inputs.pegRatio}
        tooltipText="The PEG ratio is used to determine a stock's value while also factoring in the company's expected earnings growth."
        step="0.1"
        onChange={(e) => onInputChange({ pegRatio: e.target.value })}
      />
      <NumberInput
        label="Current Stock Price"
        value={inputs.currentPrice}
        step="0.01"
        onChange={(e) => onInputChange({ currentPrice: e.target.value })}
      />
    </>
  );

  const { fairValue, difference } = useMemo(() => {
    const numEps = parseFloat(inputs.eps);
    const numEpsGrowthRate = parseFloat(inputs.epsGrowthRate);
    const numPegRatio = parseFloat(inputs.pegRatio);
    const numCurrentPrice = parseFloat(inputs.currentPrice);

    if (isNaN(numEps) || isNaN(numEpsGrowthRate) || isNaN(numPegRatio)) {
      return { fairValue: null, difference: null };
    }

    const calculatedFairValue = numEps * numEpsGrowthRate * numPegRatio;

    if (isNaN(numCurrentPrice) || numCurrentPrice <= 0) {
      return { fairValue: calculatedFairValue, difference: null };
    }

    const calculatedDifference = ((calculatedFairValue - numCurrentPrice) / numCurrentPrice) * 100;
    return { fairValue: calculatedFairValue, difference: calculatedDifference };
  }, [inputs]);

  const getDifferenceColor = (diff) => {
    if (diff === null) return '';
    if (diff < -30) return 'diff-red';
    if (diff < -10) return 'diff-amber';
    if (diff <= 0) return 'diff-light-green'; // Up to 0% difference (at or slightly below fair value)
    if (diff > 0) return 'diff-strong-green'; // Any positive difference (undervalued)
    return '';
  };

  const outputs = (
    <>
      <h3>Results</h3>
      {fairValue !== null ? (
        <CalculatorOutput
          title="Peter Lynch Fair Value"
          value={fairValue}
          difference={difference}
          getDifferenceColor={getDifferenceColor}
        />
      ) : (
        <p>
          Please enter all required inputs to see the calculated fair value.
        </p>
      )}
    </>
  );

  return (
    <>
      <CalculatorDescription>
        <p>According to Peter Lynch, a growth company's P/E should equal its growth rate, so the PEG should equal 1. A result of 1 or lower says that the stock is either at par or undervalued, based on its growth rate. If the ratio results in a number above 1, the stock is overvalued relative to its growth rate.</p>
        <p><strong>Formula:</strong> Fair Value = EPS growth rate x EPS x PEG</p>
      </CalculatorDescription>
      <CalculatorLayout inputs={inputsJsx} outputs={outputs} />
    </>
  );
}

export default PeterLynchCalculator;