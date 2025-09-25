import { useMemo } from 'react';
import CalculatorLayout from '../components/CalculatorLayout.jsx';
import CalculatorDescription from '../components/CalculatorDescription.jsx';
import FormattedNumberInput from '../components/FormattedNumberInput.jsx';
import ToggleSwitch from '../components/ToggleSwitch.jsx';
import CalculatorOutput from '../components/CalculatorOutput.jsx';
import CagrTable from '../components/CagrTable.jsx';
import MarginOfSafetyTable from '../components/MarginOfSafetyTable.jsx';

function DcfCalculator({ inputs, onInputChange }) {
  const handleCashFlowToggle = () => {
    onInputChange({ useFcf: !inputs.useFcf });
  };

  const handleGrowthToggle = () => {
    onInputChange({ useConstantGrowth: !inputs.useConstantGrowth });
  };

  const handleTerminalValueToggle = () => {
    onInputChange({ useTerminalGrowthRate: !inputs.useTerminalGrowthRate });
  };

  const handleProjectionPeriodToggle = () => {
    onInputChange({ use10YearProjection: !inputs.use10YearProjection });
  };

  const cashFlowLabel = inputs.useFcf ? 'Current Free Cash Flow' : 'Current Operating Cash Flow';
  const cashFlowTooltip = inputs.useFcf
    ? 'The most recent annual Free Cash Flow (FCF).'
    : 'The most recent annual Operating Cash Flow (OCF).';

  const inputsJsx = (
    <>
      <h3>Inputs</h3>
      <ToggleSwitch
        isToggled={!inputs.useFcf}
        onToggle={handleCashFlowToggle}
        offLabel="Use Free Cash Flow"
        onLabel="Use Operating Cash Flow"
      />
      <FormattedNumberInput
        label={cashFlowLabel}
        value={inputs.cashFlow}
        decimalPlaces={0}
        tooltipText={cashFlowTooltip}
        onChange={(e) => onInputChange({ cashFlow: e.target.value })}
      />

      <div className="input-group">
        <label className="input-label">Growth Rate Method</label>
        <ToggleSwitch
          isToggled={!inputs.useConstantGrowth}
          onToggle={handleGrowthToggle}
          offLabel="Constant Growth"
          onLabel="Variable Growth"
        />
        <ToggleSwitch
          isToggled={!inputs.use10YearProjection}
          onToggle={handleProjectionPeriodToggle}
          offLabel="10-Year Projection"
          onLabel="5-Year Projection"
        />

        {/* Constant Growth Inputs */}
        {inputs.useConstantGrowth && inputs.use10YearProjection && (
          <FormattedNumberInput
            label="Growth Rate (Next 10 Years, %)"
            value={inputs.constantGrowthRate}
            decimalPlaces={1} step="0.1"
            tooltipText="A single, constant annual growth rate for the 10-year projection period."
            onChange={(e) => onInputChange({ constantGrowthRate: e.target.value })}
          />
        )}
        {inputs.useConstantGrowth && !inputs.use10YearProjection && (
          <FormattedNumberInput
            label="Growth Rate (Next 5 Years, %)"
            value={inputs.constantGrowthRate5yr}
            decimalPlaces={1} step="0.1"
            tooltipText="A single, constant annual growth rate for the 5-year projection period."
            onChange={(e) => onInputChange({ constantGrowthRate5yr: e.target.value })}
          />
        )}

        {/* Variable Growth Inputs */}
        {!inputs.useConstantGrowth && inputs.use10YearProjection && (
          <div className="grid-2x2-inputs" style={{ marginTop: '1rem' }}>
            <FormattedNumberInput
              label="Year 1 (%)"
              value={inputs.variableGrowthRate1}
              decimalPlaces={1} step="0.1"
              onChange={(e) => onInputChange({ variableGrowthRate1: e.target.value })}
            />
            <FormattedNumberInput
              label="Years 2-4 (%)"
              value={inputs.variableGrowthRate2_4}
              decimalPlaces={1} step="0.1"
              onChange={(e) => onInputChange({ variableGrowthRate2_4: e.target.value })}
            />
            <FormattedNumberInput
              label="Years 5-7 (%)"
              value={inputs.variableGrowthRate5_7}
              decimalPlaces={1} step="0.1"
              onChange={(e) => onInputChange({ variableGrowthRate5_7: e.target.value })}
            />
            <FormattedNumberInput
              label="Years 8-10 (%)"
              value={inputs.variableGrowthRate8_10}
              decimalPlaces={1} step="0.1"
              onChange={(e) => onInputChange({ variableGrowthRate8_10: e.target.value })}
            />
          </div>
        )}
        {!inputs.useConstantGrowth && !inputs.use10YearProjection && (
          <div className="grid-2x2-inputs" style={{ marginTop: '1rem' }}>
            <FormattedNumberInput
              label="Year 1 (%)"
              value={inputs.variableGrowthRate5yr_1}
              decimalPlaces={1} step="0.1"
              onChange={(e) => onInputChange({ variableGrowthRate5yr_1: e.target.value })}
            />
            <FormattedNumberInput
              label="Years 2-3 (%)"
              value={inputs.variableGrowthRate5yr_2_3}
              decimalPlaces={1} step="0.1"
              onChange={(e) => onInputChange({ variableGrowthRate5yr_2_3: e.target.value })}
            />
            <FormattedNumberInput
              label="Years 4-5 (%)"
              value={inputs.variableGrowthRate5yr_4_5}
              decimalPlaces={1} step="0.1"
              onChange={(e) => onInputChange({ variableGrowthRate5yr_4_5: e.target.value })}
            />
          </div>
        )}
      </div>

      <div className="input-group">
        <label className="input-label">Terminal Value Method</label>
        <ToggleSwitch
          isToggled={!inputs.useTerminalGrowthRate}
          onToggle={handleTerminalValueToggle}
          offLabel="Perpetual Growth"
          onLabel="Exit Multiple"
        />
        {inputs.useTerminalGrowthRate ? (
          <FormattedNumberInput
            label="Terminal Growth Rate (%)"
            value={inputs.terminalGrowthRate}
            decimalPlaces={1}
            step="0.1"
            tooltipText="The perpetual growth rate for the years beyond the projection period. Often set to the long-term inflation rate (e.g., 2-3%)."
            onChange={(e) => onInputChange({ terminalGrowthRate: e.target.value })}
          />
        ) : (
          <FormattedNumberInput
            label={`Terminal ${inputs.useFcf ? 'FCF' : 'OCF'} Multiple`}
            value={inputs.terminalMultiple}
            decimalPlaces={1}
            step="0.1"
            tooltipText="An exit multiple applied to the final year's projected cash flow."
            onChange={(e) => onInputChange({ terminalMultiple: e.target.value })}
          />
        )}
      </div>

      <FormattedNumberInput
        label="Discount Rate (WACC, %)"
        value={inputs.discountRate}
        decimalPlaces={1}
        step="0.1"
        tooltipText="The Weighted Average Cost of Capital. This is the required rate of return for the investment."
        onChange={(e) => onInputChange({ discountRate: e.target.value })}
      />
      <FormattedNumberInput
        label="Shares Outstanding"
        value={inputs.sharesOutstanding}
        decimalPlaces={0}
        tooltipText="The total number of a company's outstanding shares."
        onChange={(e) => onInputChange({ sharesOutstanding: e.target.value })}
      />
      <FormattedNumberInput
        label="Shares Outstanding Growth Rate (%)"
        value={inputs.sharesGrowthRate}
        decimalPlaces={1}
        step="0.1"
        tooltipText="The annual growth (dilution) or decline (buybacks) in shares outstanding. Use a negative number for buybacks."
        onChange={(e) => onInputChange({ sharesGrowthRate: e.target.value })}
      />
      <FormattedNumberInput
        label="Net Cash"
        value={inputs.netCash}
        decimalPlaces={0}
        tooltipText="Cash & Cash Equivalents minus Total Debt. Enter a negative number if the company has net debt."
        onChange={(e) => onInputChange({ netCash: e.target.value })}
      />
      <FormattedNumberInput
        label="Current Stock Price"
        value={inputs.currentPrice}
        decimalPlaces={2}
        onChange={(e) => onInputChange({ currentPrice: e.target.value })}
      />
    </>
  );

  const { intrinsicValue, difference, futureStockPrice, futurePriceDifference } = useMemo(() => {
    const numCashFlow = parseFloat(inputs.cashFlow);
    const numDiscountRate = parseFloat(inputs.discountRate) / 100;
    const numShares = parseFloat(inputs.sharesOutstanding);
    const numNetCash = parseFloat(inputs.netCash);
    const numSharesGrowthRate = parseFloat(inputs.sharesGrowthRate) / 100;
    const numCurrentPrice = parseFloat(inputs.currentPrice);
    const projectionYears = inputs.use10YearProjection ? 10 : 5;
    
    const growthRates = [];
    if (inputs.useConstantGrowth) {
      const rateKey = inputs.use10YearProjection ? 'constantGrowthRate' : 'constantGrowthRate5yr';
      const constantRate = parseFloat(inputs[rateKey]) / 100;
      if (isNaN(constantRate)) return {};
      for (let i = 0; i < projectionYears; i++) growthRates.push(constantRate);
    } else {
      if (inputs.use10YearProjection) {
        const r1 = parseFloat(inputs.variableGrowthRate1) / 100;
        const r2_4 = parseFloat(inputs.variableGrowthRate2_4) / 100;
        const r5_7 = parseFloat(inputs.variableGrowthRate5_7) / 100;
        const r8_10 = parseFloat(inputs.variableGrowthRate8_10) / 100;
        if (isNaN(r1) || isNaN(r2_4) || isNaN(r5_7) || isNaN(r8_10)) return {};
        growthRates.push(r1, r2_4, r2_4, r2_4, r5_7, r5_7, r5_7, r8_10, r8_10, r8_10);
      } else { // 5-year projection
        const r1 = parseFloat(inputs.variableGrowthRate5yr_1) / 100;
        const r2_3 = parseFloat(inputs.variableGrowthRate5yr_2_3) / 100;
        const r4_5 = parseFloat(inputs.variableGrowthRate5yr_4_5) / 100;
        if (isNaN(r1) || isNaN(r2_3) || isNaN(r4_5)) return {};
        growthRates.push(r1, r2_3, r2_3, r4_5, r4_5);
      }
    }

    // Validation for terminal growth rate method
    const numTerminalGrowthRate = parseFloat(inputs.terminalGrowthRate) / 100;
    if (inputs.useTerminalGrowthRate && (isNaN(numTerminalGrowthRate) || numDiscountRate <= numTerminalGrowthRate)) {
      return {};
    }

    if (
      isNaN(numCashFlow) || isNaN(numDiscountRate) || 
      isNaN(numShares) || isNaN(numNetCash) || isNaN(numSharesGrowthRate) || numShares <= 0
    ) {
      return {};
    }

    // 1. Project and discount cash flows for the high-growth period (10 years)
    let sumOfDiscountedCF = 0;
    let lastProjectedCF = numCashFlow;
    for (let i = 1; i <= projectionYears; i++) {
      // Get the growth rate for the current year (index i-1)
      const growthRate = growthRates[i - 1];
      if (isNaN(growthRate)) {
        // If any growth rate is invalid, stop calculation
        return {};
      }

      const projectedCF = lastProjectedCF * (1 + growthRate);
      sumOfDiscountedCF += projectedCF / Math.pow(1 + numDiscountRate, i);
      lastProjectedCF = projectedCF;
    }

    // 2. Calculate Terminal Value and discount it
    let terminalValue = 0;
    if (inputs.useTerminalGrowthRate) {
      terminalValue = (lastProjectedCF * (1 + numTerminalGrowthRate)) / (numDiscountRate - numTerminalGrowthRate);
    } else {
      const numTerminalMultiple = parseFloat(inputs.terminalMultiple);
      if (isNaN(numTerminalMultiple)) return {};
      terminalValue = lastProjectedCF * numTerminalMultiple;
    }
    const discountedTerminalValue = terminalValue / Math.pow(1 + numDiscountRate, projectionYears);

    // 3. Calculate Enterprise and Equity Value
    const enterpriseValue = sumOfDiscountedCF + discountedTerminalValue;
    const equityValue = enterpriseValue + numNetCash;

    // Project shares outstanding to the end of the period
    const futureSharesOutstanding = numShares * Math.pow(1 + numSharesGrowthRate, projectionYears);

    // 4. Calculate Intrinsic Value per Share
    const calculatedIntrinsicValue = equityValue / futureSharesOutstanding;

    // 5. Calculate Future Stock Price
    // We assume Net Cash grows at the terminal rate to find future equity value.
    const futureNetCash = numNetCash * Math.pow(1 + numTerminalGrowthRate, projectionYears);
    const futureEnterpriseValue = terminalValue; // Terminal value is the enterprise value at the end of the projection period
    const futureEquityValue = futureEnterpriseValue + futureNetCash;
    const calculatedFutureStockPrice = futureEquityValue / futureSharesOutstanding;

    let calculatedDifference = null;
    let calculatedFuturePriceDifference = null;

    if (isNaN(numCurrentPrice) || numCurrentPrice <= 0) {
      return { intrinsicValue: calculatedIntrinsicValue, futureStockPrice: calculatedFutureStockPrice };
    }

    calculatedDifference = ((calculatedIntrinsicValue - numCurrentPrice) / calculatedIntrinsicValue) * 100;
    calculatedFuturePriceDifference = ((calculatedFutureStockPrice - numCurrentPrice) / numCurrentPrice) * 100;

    return { intrinsicValue: calculatedIntrinsicValue, difference: calculatedDifference, futureStockPrice: calculatedFutureStockPrice, futurePriceDifference: calculatedFuturePriceDifference };
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
      {intrinsicValue !== null ? (
        <>
          <CalculatorOutput
            title="DCF Intrinsic Value"
            value={intrinsicValue}
            difference={difference}
            getDifferenceColor={getDifferenceColor}
          />
          {futureStockPrice !== null && (
            <>
              <div>
                <CalculatorOutput
                  title={`Implied Future Price (Year ${inputs.use10YearProjection ? 10 : 5})`}
                  value={futureStockPrice}
                  difference={futurePriceDifference}
                  comparisonText={`${futurePriceDifference > 0 ? '+' : ''}${futurePriceDifference.toFixed(1)}% vs. current stock price`}
                />
              </div>
              <MarginOfSafetyTable intrinsicValue={intrinsicValue} />
              <CagrTable
                buyPrices={[
                  ...(!isNaN(parseFloat(inputs.currentPrice)) && parseFloat(inputs.currentPrice) > 0
                    ? [{ label: 'Current Price', price: parseFloat(inputs.currentPrice) }]
                    : []),
                  { label: 'Intrinsic Value', price: intrinsicValue },
                  ...[10, 20, 30, 40, 50].map((mos) => ({
                    label: `${mos}% Margin of Safety`,
                    price: intrinsicValue * (1 - mos / 100),
                  })),
                ]}
                futureStockPrice={futureStockPrice}
                projectionYears={inputs.use10YearProjection ? 10 : 5}
              />
            </>
          )}
        </>
      ) : (
        <p>Please enter all required inputs to see the calculated intrinsic value. Ensure Discount Rate is greater than Terminal Growth Rate.</p>
      )}
    </>
  );

  return (
    <>
      <CalculatorDescription>
        <p>
          The Discounted Cash Flow (DCF) model is a valuation method used to estimate the value of an investment based on its expected future cash flows. The model works by projecting future cash flows and discounting them back to the present day to arrive at an "intrinsic value".
        </p>
        <p>
          <strong>Formula:</strong> Intrinsic Value = Sum of Discounted Future Cash Flows + Discounted Terminal Value
        </p>
      </CalculatorDescription>
      <CalculatorLayout inputs={inputsJsx} outputs={outputs} />
    </>
  );
}

export default DcfCalculator;