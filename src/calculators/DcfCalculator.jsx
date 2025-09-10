import { useState } from 'react';
import CalculatorLayout from '../components/CalculatorLayout.jsx';
import NumberInput from '../components/NumberInput.jsx';
import CalculatorDescription from '../components/CalculatorDescription.jsx';

function DcfCalculator() {
  const [currentFcf, setCurrentFcf] = useState('');
  const [growthRate, setGrowthRate] = useState('');

  const inputs = (
    <>
      <h3>Inputs</h3>
      <NumberInput
        label="Current Free Cash Flow (FCF)"
        description="The most recent annual FCF in millions."
        value={currentFcf}
        tooltipText="Free Cash Flow is the cash a company produces through its operations, less the cost of expenditures on assets."
        onChange={(e) => setCurrentFcf(e.target.value)}
      />
      <NumberInput
        label="Projected Growth Rate (%)"
        description="Your estimated annual growth rate for the next 5-10 years."
        value={growthRate}
        tooltipText="This is your conservative estimate of the company's future growth. It can often be found in analyst reports or you can derive it from historical growth."
        onChange={(e) => setGrowthRate(e.target.value)}
      />
    </>
  );

  const outputs = (
    <p>Output will be displayed here.</p>
  );

  return (
    <>
      <CalculatorDescription>
        A Discounted Cash Flow (DCF) analysis is a method of valuation that estimates the value of an investment based on its expected future cash flows. The goal is to project all of the future cash a company is expected to generate and discount it to its present-day value.
      </CalculatorDescription>
      <CalculatorLayout inputs={inputs} outputs={outputs} />
    </>
  );
}

export default DcfCalculator;