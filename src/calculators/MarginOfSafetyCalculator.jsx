import { useState, useMemo, useCallback } from 'react';
import CalculatorLayout from '../components/CalculatorLayout.jsx';
import CalculatorDescription from '../components/CalculatorDescription.jsx';
import FormattedNumberInput from '../components/FormattedNumberInput.jsx';
import CalculatorOutput from '../components/CalculatorOutput.jsx';

function MarginOfSafetyCalculator({ inputs, onInputChange, onReset }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [prediction, setPrediction] = useState(null);

  const isFormValid = useMemo(() => {
    return Object.values(inputs).every(value => value.trim() !== '');
  }, [inputs]);

  const inputsJsx = (
    <>
      <h3>Inputs</h3>
      <FormattedNumberInput
        label="Market Cap"
        value={inputs.marketCap}
        decimalPlaces={0}
        tooltipText="The total market value of a company's outstanding shares. Can be found on most financial websites."
        onChange={(e) => onInputChange({ marketCap: e.target.value })}
      />
      <FormattedNumberInput
        label="P/E Ratio"
        value={inputs.peRatio}
        decimalPlaces={2}
        tooltipText="Price-to-Earnings ratio. Can be found on most financial websites."
        onChange={(e) => onInputChange({ peRatio: e.target.value })}
      />
      <FormattedNumberInput
        label="P/S Ratio"
        value={inputs.psRatio}
        decimalPlaces={2}
        tooltipText="Price-to-Sales ratio. Can be found on most financial websites."
        onChange={(e) => onInputChange({ psRatio: e.target.value })}
      />
      <FormattedNumberInput
        label="Revenue 3-year CAGR (%)"
        value={inputs.revenueCagr}
        decimalPlaces={1}
        tooltipText="The compound annual growth rate of revenue over the last 3 years. May need to be calculated manually."
        onChange={(e) => onInputChange({ revenueCagr: e.target.value })}
      />
      <FormattedNumberInput
        label="Total Assets"
        value={inputs.totalAssets}
        decimalPlaces={0}
        tooltipText="Found on the company's Balance Sheet."
        onChange={(e) => onInputChange({ totalAssets: e.target.value })}
      />
      <FormattedNumberInput
        label="Total Debt"
        value={inputs.totalDebt}
        decimalPlaces={0}
        tooltipText="The sum of short-term and long-term debt. Found on the Balance Sheet."
        onChange={(e) => onInputChange({ totalDebt: e.target.value })}
      />
      <FormattedNumberInput
        label="Long-Term Debt"
        value={inputs.longTermDebt}
        decimalPlaces={0}
        tooltipText="Debt with a maturity of more than one year. Found on the Balance Sheet."
        onChange={(e) => onInputChange({ longTermDebt: e.target.value })}
      />
      <FormattedNumberInput
        label="Capital Expenditure"
        value={inputs.capEx}
        decimalPlaces={0}
        description="Enter as a positive value even though it is an expense."
        tooltipText="Capital Expenditure (CapEx). Found on the Cash Flow Statement."
        onChange={(e) => onInputChange({ capEx: e.target.value })}
      />
      <FormattedNumberInput
        label="Free Cash Flow"
        value={inputs.fcf}
        decimalPlaces={0}
        tooltipText="Free Cash Flow (FCF). Can be found on financial websites or calculated from the Cash Flow Statement."
        onChange={(e) => onInputChange({ fcf: e.target.value })}
      />
      <FormattedNumberInput
        label="Net Cash"
        value={inputs.netCash}
        decimalPlaces={0}
        tooltipText="Cash & Cash Equivalents minus Total Debt. Can be calculated from the Balance Sheet."
        onChange={(e) => onInputChange({ netCash: e.target.value })}
      />
    </>
  );

  const handleSubmit = useCallback(async () => {
    if (!isFormValid) {
      setError("Please fill in all input fields before calculating.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setPrediction(null);

    try {
      const apiUrl = 'https://keskid83-stock-analysis-api.hf.space/predict';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inputs),
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        } else {
          const textError = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, message: ${textError}`);
        }
      }

      const result = await response.json();
      setPrediction(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [inputs, isFormValid]);

  const outputs = (
    <>
      <h3>Results</h3>
      <div className="button-group">
        <button onClick={handleSubmit} disabled={isLoading || !isFormValid} className="calculate-button">
          {isLoading ? 'Calculating...' : 'Calculate Margin of Safety'}
        </button>
        <button onClick={onReset} className="reset-button">
          Reset
        </button>
      </div>
      {!isFormValid && !isLoading && (
        <p style={{ color: 'var(--on-surface-secondary-color)', marginTop: '1rem', fontSize: '0.9rem' }}>
          Please fill in all inputs to enable calculation.
        </p>
      )}

      {prediction && (
        <CalculatorOutput
          title="Predicted Margin of Safety"
          value={prediction.predicted_margin_of_safety}
          isInteger={false} // Assuming the prediction can be a float
          comparisonText={`${prediction.predicted_margin_of_safety.toFixed(1)}%`}
        />
      )}

      {error && <p style={{ color: 'var(--red-color)', marginTop: '1rem' }}>{error}</p>}
    </>
  );

  return (
    <>
      <CalculatorDescription>
        <p>
          This calculator uses a machine learning model to predict a suitable Margin of Safety based on various financial metrics. Enter the required data below and click calculate to get the model's prediction. The higher the number the better the predicted margin of safety. Negative number suggest potential overvaluation.
        </p>
        <p>
          This machine learning model was the focus of my Master's research project, and the thesis report can be found at this link: <a href="https://norma.ncirl.ie/8796/" target="_blank" rel="noopener noreferrer" className="description-link">https://norma.ncirl.ie/8796/</a>
        </p>
      </CalculatorDescription>
      <CalculatorLayout inputs={inputsJsx} outputs={outputs} />
    </>
  );
}

export default MarginOfSafetyCalculator;