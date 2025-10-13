import { useState } from 'react';
import { trackedStocks } from './config/stocks';
import { calculatorList } from './config/calculators';
import PeterLynchCalculator from './calculators/PeterLynchCalculator.jsx';
import BenGrahamCalculator from './calculators/BenGrahamCalculator.jsx';
import RuleOneCalculator from './calculators/RuleOneCalculator.jsx';
import TenCapCalculator from './calculators/TenCapCalculator.jsx';
import PriceToFcfCalculator from './calculators/PriceToFcfCalculator.jsx';
import MarginOfSafetyCalculator from './calculators/MarginOfSafetyCalculator.jsx';
import DcfCalculator from './calculators/DcfCalculator.jsx';

// Configuration for synchronizing input fields across calculators
const sharedFieldsConfig = {
  // Free Cash Flow
  fcf: {
    dcf: { field: 'cashFlow', condition: (state) => state.dcf.useFcf },
    price_to_fcf: { field: 'fcf' },
    margin_of_safety: { field: 'fcf' },
  },
  // Current Stock Price
  currentPrice: {
    dcf: { field: 'currentPrice' },
    price_to_fcf: { field: 'currentPrice' },
    rule_one: { field: 'currentPrice' },
    peter_lynch: { field: 'currentPrice' },
    ben_graham: { field: 'currentPrice' },
  },
  // Shares Outstanding
  sharesOutstanding: {
    dcf: { field: 'sharesOutstanding' },
    price_to_fcf: { field: 'sharesOutstanding' },
  },
  // Net Cash
  netCash: {
    dcf: { field: 'netCash' },
    margin_of_safety: { field: 'netCash' },
  },
  // Current EPS
  eps: {
    rule_one: { field: 'eps' },
    peter_lynch: { field: 'eps' },
    ben_graham: { field: 'eps' },
  },
  // Capital Expenditure
  capEx: {
    margin_of_safety: { field: 'capEx' },
    ten_cap: { field: 'totalCapEx', condition: (state) => !state.ten_cap.useDirectMaintCapEx },
  },
};


function App() {
  // 'useState' is a React Hook to manage state.
  // 'activeSection' holds the ID of the currently visible section.
  // 'setActiveSection' is the function to update it.
  const [activeSection, setActiveSection] = useState('Stocks');

  // State for the currently selected stock ticker. Initialize with the first stock.
  const [selectedStock, setSelectedStock] = useState(trackedStocks[0]?.ticker || '');

  // State for the currently selected calculator.
  const [selectedCalculator, setSelectedCalculator] = useState(calculatorList[0]?.id || '');

  // Centralized state for all calculator inputs
  const [calculatorInputs, setCalculatorInputs] = useState({
    dcf: {
      useFcf: true, // Toggle for FCF vs OCF
      cashFlow: '',
      useConstantGrowth: true, // Toggle for growth rate method
      use10YearProjection: true, // Toggle for projection period
      constantGrowthRate: '',
      variableGrowthRate1: '',
      variableGrowthRate2_4: '',
      variableGrowthRate5_7: '',
      variableGrowthRate8_10: '',
      constantGrowthRate5yr: '',
      variableGrowthRate5yr_1: '',
      variableGrowthRate5yr_2_3: '',
      variableGrowthRate5yr_4_5: '',
      useTerminalGrowthRate: true, // Toggle for terminal value method
      terminalGrowthRate: '2.5',
      terminalMultiple: '',
      discountRate: '10.0',
      sharesOutstanding: '',
      sharesGrowthRate: '0.0',
      netCash: '',
      currentPrice: '',
    },
    peter_lynch: {
      eps: '',
      epsGrowthRate: '',
      pegRatio: '1.0',
      currentPrice: '',
    },
    ben_graham: {
      eps: '',
      epsGrowthRate: '',
      avgYield: '4.4',
      currentYield: '',
      currentPrice: '',
    },
    rule_one: {
      eps: '',
      epsGrowthRate: '',
      futurePe: '',
      minRateOfReturn: '15.0',
      years: '10',
      currentPrice: '',
    },
    ten_cap: {
      netIncome: '',
      depreciation: '',
      workingCapital: '',
      maintCapExDirect: '',
      totalCapEx: '',
      maintCapExPercentage: '50',
      marketCap: '',
      useDirectMaintCapEx: true, // Toggle for which CapEx input to use
    },
    price_to_fcf: {
      fcf: '',
      fcfChange: '0',
      fcfMultiple: '',
      sharesOutstanding: '',
      currentPrice: '',
    },
    margin_of_safety: {
      marketCap: '',
      peRatio: '',
      psRatio: '',
      revenueCagr: '',
      totalAssets: '',
      totalDebt: '',
      longTermDebt: '',
      capEx: '',
      fcf: '',
      netCash: '',
    },
    // We will add other calculators here as we build them
  });

  // Function to update the state for a specific calculator
  const handleCalculatorInputChange = (calculatorId, newInputs) => {
    setCalculatorInputs((currentInputs) => {
      // Create a mutable copy of the state to apply updates
      const nextInputs = { ...currentInputs };

      // 1. Apply the direct change from the user's input
      nextInputs[calculatorId] = {
        ...nextInputs[calculatorId],
        ...newInputs,
      };

      // 2. Handle synchronization for shared fields
      const changedInputKey = Object.keys(newInputs)[0];
      const changedValue = newInputs[changedInputKey];

      // Find which sync group, if any, this change belongs to
      for (const group of Object.values(sharedFieldsConfig)) {
        const syncConfig = group[calculatorId];
        if (syncConfig && syncConfig.field === changedInputKey) {
          // This is a shared field, so update all other calculators in the same group
          for (const [otherCalcId, otherSyncConfig] of Object.entries(group)) {
            if (otherCalcId !== calculatorId) {
              // Check if the synchronization is conditional
              if (!otherSyncConfig.condition || otherSyncConfig.condition(nextInputs)) {
                nextInputs[otherCalcId][otherSyncConfig.field] = changedValue;
              }
            }
          }
        }
      }

      return nextInputs;
    });
  };

  return (
    <>
      <header className="app-header">
        <h1>My Stock Tracker</h1>
      </header>

      <nav className="main-nav">
        <button
          className={`tab-link ${activeSection === 'Stocks' ? 'active' : ''}`}
          onClick={() => setActiveSection('Stocks')}>
          Stock Tracker
        </button>
        <button
          className={`tab-link ${activeSection === 'Calculators' ? 'active' : ''}`}
          onClick={() => setActiveSection('Calculators')}>
          Calculators
        </button>
      </nav>

      <main>
        {/* Stock Tracker Section - Conditionally rendered */}
        {activeSection === 'Stocks' && (
          <section id="Stocks" className="tab-content" style={{ display: 'block' }}>
            <div className="sub-nav-container">
              <label htmlFor="stock-select">Select Stock:</label>
              <select 
                id="stock-select" 
                className="dropdown-nav" 
                value={selectedStock}
                onChange={(e) => setSelectedStock(e.target.value)}
              >
                {trackedStocks.map((stock) => (
                  <option key={stock.ticker} value={stock.ticker}>{stock.name} ({stock.ticker})</option>
                ))}
              </select>
            </div>
            <div id="stock-content" className="content-area">
              <p>Content for {selectedStock} will be displayed here.</p>
            </div>
          </section>
        )}

        {/* Calculators Section - Conditionally rendered */}
        {activeSection === 'Calculators' && (
          <section id="Calculators" className="tab-content" style={{ display: 'block' }}>
            <div className="sub-nav-container">
              <label htmlFor="calc-select">Select Calculator:</label>
              <select 
                id="calc-select" 
                className="dropdown-nav"
                value={selectedCalculator}
                onChange={(e) => setSelectedCalculator(e.target.value)}
              >
                {calculatorList.map((calc) => (
                  <option key={calc.id} value={calc.id}>
                    {calc.name}
                  </option>
                ))}
              </select>
            </div>
            <div id="calc-content" className="content-area">
              {/* Conditionally render the selected calculator component */}
              {selectedCalculator === 'dcf' && (
                <DcfCalculator
                  inputs={calculatorInputs.dcf}
                  onInputChange={(newInputs) => handleCalculatorInputChange('dcf', newInputs)}
                />
              )}
              {selectedCalculator === 'peter_lynch' && (
                <PeterLynchCalculator
                  inputs={calculatorInputs.peter_lynch}
                  onInputChange={(newInputs) => handleCalculatorInputChange('peter_lynch', newInputs)}
                />
              )}
              {selectedCalculator === 'ben_graham' && (
                <BenGrahamCalculator
                  inputs={calculatorInputs.ben_graham}
                  onInputChange={(newInputs) => handleCalculatorInputChange('ben_graham', newInputs)}
                />
              )}
              {selectedCalculator === 'rule_one' && (
                <RuleOneCalculator
                  inputs={calculatorInputs.rule_one}
                  onInputChange={(newInputs) => handleCalculatorInputChange('rule_one', newInputs)}
                />
              )}
              {selectedCalculator === 'ten_cap' && (
                <TenCapCalculator
                  inputs={calculatorInputs.ten_cap}
                  onInputChange={(newInputs) => handleCalculatorInputChange('ten_cap', newInputs)}
                />
              )}
              {selectedCalculator === 'price_to_fcf' && (
                <PriceToFcfCalculator
                  inputs={calculatorInputs.price_to_fcf}
                  onInputChange={(newInputs) => handleCalculatorInputChange('price_to_fcf', newInputs)}
                />
              )}
              {selectedCalculator === 'margin_of_safety' && (
                <MarginOfSafetyCalculator
                  inputs={calculatorInputs.margin_of_safety}
                  onInputChange={(newInputs) => handleCalculatorInputChange('margin_of_safety', newInputs)}
                />
              )}

              {/* Add other calculators here as we build them */}
              {selectedCalculator !== 'dcf' && selectedCalculator !== 'peter_lynch' && selectedCalculator !== 'ben_graham' &&
                selectedCalculator !== 'rule_one' && selectedCalculator !== 'ten_cap' &&
                selectedCalculator !== 'price_to_fcf' && selectedCalculator !== 'margin_of_safety' && (
                <p>This calculator has not been built yet.</p>
              )}
            </div>
          </section>
        )}
      </main>
    </>
  );
}

export default App;