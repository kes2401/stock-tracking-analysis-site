import { useState } from 'react';
import { trackedStocks } from './config/stocks';
import { calculatorList } from './config/calculators';
import DcfCalculator from './calculators/DcfCalculator.jsx';

function App() {
  // 'useState' is a React Hook to manage state.
  // 'activeSection' holds the ID of the currently visible section.
  // 'setActiveSection' is the function to update it.
  const [activeSection, setActiveSection] = useState('Stocks');
  
  // State for the currently selected stock ticker. Initialize with the first stock.
  const [selectedStock, setSelectedStock] = useState(trackedStocks[0]?.ticker || '');
  
  // State for the currently selected calculator.
  const [selectedCalculator, setSelectedCalculator] = useState(calculatorList[0]?.id || '');
  
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
              {selectedCalculator === 'dcf' && <DcfCalculator />}

              {/* Add other calculators here as we build them */}
              {selectedCalculator !== 'dcf' && <p>This calculator has not been built yet.</p>}
            </div>
          </section>
        )}
      </main>
    </>
  );
}

export default App;