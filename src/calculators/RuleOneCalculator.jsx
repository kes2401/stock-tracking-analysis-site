import { useMemo } from 'react';
import CalculatorLayout from '../components/CalculatorLayout.jsx';
import NumberInput from '../components/NumberInput.jsx';
import CalculatorDescription from '../components/CalculatorDescription.jsx';
import CalculatorOutput from '../components/CalculatorOutput.jsx';

function RuleOneCalculator({ inputs, onInputChange }) {
  const inputsJsx = (
    <>
      <h3>Inputs</h3>
      <NumberInput
        label="Current EPS"
        value={inputs.eps}
        step="0.01"
        tooltipText="The trailing twelve months (TTM) earnings per share."
        onChange={(e) => onInputChange({ eps: e.target.value })}
      />
      <NumberInput
        label="Expected EPS Growth Rate (%)"
        description="Phil Town recommends this is not higher than 15%."
        value={inputs.epsGrowthRate}
        step="0.01"
        tooltipText="Your conservative estimate of the company's future EPS growth."
        onChange={(e) => onInputChange({ epsGrowthRate: e.target.value })}
      />
      <NumberInput
        label="Expected Future P/E"
        value={inputs.futurePe}
        step="0.01"
        tooltipText="The estimated Price-to-Earnings ratio in the future. This can be based on historical averages or analyst estimates."
        onChange={(e) => onInputChange({ futurePe: e.target.value })}
      />
      <NumberInput
        label="Minimum Acceptable Rate of Return (%)"
        value={inputs.minRateOfReturn}
        step="0.1"
        tooltipText="The minimum return you require from your investment. Rule #1 investors typically use 15%."
        onChange={(e) => onInputChange({ minRateOfReturn: e.target.value })}
      />
      <NumberInput
        label="Number of Years"
        value={inputs.years}
        step="1"
        tooltipText="The number of years to project forward. Rule #1 investors typically use 10 years."
        onChange={(e) => onInputChange({ years: e.target.value })}
      />
      <NumberInput
        label="Current Stock Price"
        value={inputs.currentPrice}
        step="0.01"
        onChange={(e) => onInputChange({ currentPrice: e.target.value })}
      />
    </>
  );

  const { fairValue, difference, marginOfSafetyPrice } = useMemo(() => {
    const numEps = parseFloat(inputs.eps);
    const numEpsGrowthRate = parseFloat(inputs.epsGrowthRate) / 100; // Convert to decimal
    const numFuturePe = parseFloat(inputs.futurePe);
    const numMinRateOfReturn = parseFloat(inputs.minRateOfReturn) / 100; // Convert to decimal
    const numYears = parseInt(inputs.years, 10);
    const numCurrentPrice = parseFloat(inputs.currentPrice);

    if (isNaN(numEps) || isNaN(numEpsGrowthRate) || isNaN(numFuturePe) || isNaN(numMinRateOfReturn) || isNaN(numYears)) {
      return { fairValue: null, difference: null, marginOfSafetyPrice: null };
    }

    // 1. Calculate Future EPS
    const futureEps = numEps * Math.pow(1 + numEpsGrowthRate, numYears);

    // 2. Calculate Future Market Price
    const futureMarketPrice = futureEps * numFuturePe;

    // 3. Calculate Fair Value (Sticker Price)
    const calculatedFairValue = futureMarketPrice / Math.pow(1 + numMinRateOfReturn, numYears);

    if (isNaN(numCurrentPrice) || numCurrentPrice <= 0) {
      return { fairValue: calculatedFairValue, difference: null, marginOfSafetyPrice: calculatedFairValue * 0.5 };
    }

    const calculatedDifference = ((calculatedFairValue - numCurrentPrice) / calculatedFairValue) * 100;
    return {
      fairValue: calculatedFairValue,
      difference: calculatedDifference,
      marginOfSafetyPrice: calculatedFairValue * 0.5,
    };
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
      {fairValue !== null ? (
        <>
          <CalculatorOutput
            title="Rule #1 Sticker Price"
            value={fairValue}
            difference={difference}
            getDifferenceColor={getDifferenceColor}
          />
          <div style={{ marginTop: '2rem' }}>
            <CalculatorOutput
              title="Rule #1 Margin of Safety Price (50%)"
              value={marginOfSafetyPrice}
            />
          </div>
        </>
      ) : (
        <p>Please enter all required inputs to see the calculated fair value.</p>
      )}
    </>
  );

  return (
    <>
      <CalculatorDescription>
        <p>
          The Rule #1 Margin of Safety Calculator was created by Phil Town and uses the EPS and future growth rate to determine the "Sticker Price" (or fair value) of a company. It then calculates the Margin of Safety price, which is half of the sticker price, to determine the price at which a Rule #1 investor could safely buy the company in order to make a 15% return over a period of 10 years.
        </p>
        <p>
          <strong>Formulas:</strong>
          <br />
          1. Future EPS = Current EPS * (1 + Growth Rate) ^ Years
          <br />
          2. Future Market Price = Future EPS * Future P/E
          <br />
          3. Sticker Price (Fair Value) = Future Market Price / (1 + Rate of Return) ^ Years
        </p>
      </CalculatorDescription>
      <CalculatorLayout inputs={inputsJsx} outputs={outputs} />
    </>
  );
}

export default RuleOneCalculator;