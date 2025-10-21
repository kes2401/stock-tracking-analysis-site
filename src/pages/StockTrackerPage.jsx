import { useState, useEffect, useMemo } from 'react';
import { trackedStocks as defaultStocks } from '../config/stocks.js';
import MarkdownDisplay from '../components/MarkdownDisplay.jsx';
import './StockTrackerPage.css';

// Custom hook to manage state with localStorage persistence
const usePersistentState = (key, defaultValue) => {
  const [state, setState] = useState(() => {
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : defaultValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState];
};

function StockTrackerPage() {
  const [trackedStocks, setTrackedStocks] = usePersistentState('trackedStocks', defaultStocks);
  const [selectedStockTicker, setSelectedStockTicker] = usePersistentState('selectedStockTicker', defaultStocks[0]?.ticker || '');
  const [isEditMode, setIsEditMode] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [newStockName, setNewStockName] = useState('');
  const [newStockTicker, setNewStockTicker] = useState('');

  const selectedStock = useMemo(() => {
    return trackedStocks.find(stock => stock.ticker === selectedStockTicker) || trackedStocks[0];
  }, [selectedStockTicker, trackedStocks]);

  useEffect(() => {
    if (!selectedStock) return;

    const fetchAnalysis = async () => {
      setIsLoading(true);
      setError(null);
      setAnalysis(null);

      try {
        const response = await fetch('https://keskid83-stock-analysis-api.hf.space/stock-analysis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: selectedStock.name, ticker: selectedStock.ticker }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || `HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        setAnalysis(result);
      } catch (e) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalysis();
  }, [selectedStock]);

  const handleAddStock = () => {
    if (newStockName.trim() && newStockTicker.trim()) {
      const newStock = { name: newStockName.trim(), ticker: newStockTicker.trim().toUpperCase() };
      if (!trackedStocks.some(s => s.ticker === newStock.ticker)) {
        setTrackedStocks([...trackedStocks, newStock]);
        setNewStockName('');
        setNewStockTicker('');
      }
    }
  };

  const handleDeleteStock = (tickerToDelete) => {
    const newStockList = trackedStocks.filter(stock => stock.ticker !== tickerToDelete);
    setTrackedStocks(newStockList);
    // If the deleted stock was the selected one, select the first in the new list
    if (selectedStockTicker === tickerToDelete) {
      setSelectedStockTicker(newStockList[0]?.ticker || '');
    }
  };

  if (isEditMode) {
    return (
      <div className="stock-editor-container">
        <h2>Edit Stock List</h2>
        <div className="stock-list">
          {trackedStocks.map(stock => (
            <div key={stock.ticker} className="stock-list-item">
              <span>{stock.name} ({stock.ticker})</span>
              <button onClick={() => handleDeleteStock(stock.ticker)} className="delete-button">
                🗑️
              </button>
            </div>
          ))}
        </div>
        <div className="add-stock-form">
          <h3>Add New Stock</h3>
          <input
            type="text"
            placeholder="Company Name (e.g., Apple Inc.)"
            value={newStockName}
            onChange={(e) => setNewStockName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Ticker Symbol (e.g., AAPL)"
            value={newStockTicker}
            onChange={(e) => setNewStockTicker(e.target.value)}
          />
          <button onClick={handleAddStock} className="add-button">Add Stock</button>
        </div>
        <button onClick={() => setIsEditMode(false)} className="done-button">Done</button>
      </div>
    );
  }

  return (
    <>
      <div className="sub-nav-container">
        <label htmlFor="stock-select">Select Stock:</label>
        <select
          id="stock-select"
          className="dropdown-nav"
          value={selectedStockTicker}
          onChange={(e) => setSelectedStockTicker(e.target.value)}
        >
          {trackedStocks.map((stock) => (
            <option key={stock.ticker} value={stock.ticker}>{stock.name} ({stock.ticker})</option>
          ))}
        </select>
        <button onClick={() => setIsEditMode(true)} className="edit-list-button" title="Edit stock list">
          ✏️
        </button>
      </div>
      <div id="stock-content" className="content-area">
        {isLoading && <p className="loading-text">Analysing {selectedStock?.name}...</p>}
        {error && <p className="error-text">Error: {error}</p>}
        {analysis && (
          <div className="analysis-container">
            <div className="analysis-section">
              <h4>Recent News Summary (Last 48 hours)</h4>
              <MarkdownDisplay>{analysis.news_summary}</MarkdownDisplay>
            </div>
            <div className="analysis-section">
              <h4>SWOT Analysis</h4>
              <MarkdownDisplay>{analysis.swot_analysis}</MarkdownDisplay>
            </div>
            <div className="analysis-section">
              <h4>Top Competitors</h4>
              <MarkdownDisplay>{analysis.competitors}</MarkdownDisplay>
            </div>
            <div className="analysis-section">
              <h4>Recent Earnings Summary</h4>
              <MarkdownDisplay>{analysis.earnings_summary}</MarkdownDisplay>
            </div>
            <div className="analysis-section">
              <h4>Market Risks</h4>
              <MarkdownDisplay>{analysis.risks}</MarkdownDisplay>
            </div>
            <p className="disclaimer">
              <i>AI-generated summary. Information may be inaccurate. Please verify with primary sources.</i>
            </p>
          </div>
        )}
      </div>
    </>
  );
}

export default StockTrackerPage;