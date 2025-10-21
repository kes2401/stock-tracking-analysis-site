import { useState, useEffect, useMemo, useCallback } from 'react';
import { trackedStocks as defaultStocks } from '../config/stocks.js';
import MarkdownDisplay from '../components/MarkdownDisplay.jsx';
import './StockTrackerPage.css';
import useCachedFetch from './useCachedFetch.js';

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
  const [localAnalysis, setLocalAnalysis] = useState(null);

  const [newStockName, setNewStockName] = useState('');
  const [newStockTicker, setNewStockTicker] = useState('');

  const selectedStock = useMemo(() => {
    return trackedStocks.find(stock => stock.ticker === selectedStockTicker) || trackedStocks[0];
  }, [selectedStockTicker, trackedStocks]);

  const cacheKey = useMemo(() => `stockAnalysis_${selectedStock?.ticker}`, [selectedStock]);
  const SIX_HOURS_MS = 6 * 3600 * 1000;

  const analysisFetcher = useCallback(async () => {
    const response = await fetch('https://keskid83-stock-analysis-api.hf.space/stock-analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: selectedStock.name, ticker: selectedStock.ticker }),
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || `HTTP error! Status: ${response.status}`);
    }
    return response.json();
  }, [selectedStock]);

  const { data: analysis, error, isLoading, forceRefresh: forceRefreshHook } = useCachedFetch(cacheKey, analysisFetcher, SIX_HOURS_MS, [selectedStock]);

  // Sync local state with fetched data
  useEffect(() => {
    setLocalAnalysis(analysis);
  }, [analysis, setLocalAnalysis]);

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

  const handleForceRefresh = useCallback(() => {
    // Immediately clear local data to show loading state
    setLocalAnalysis(null);
    forceRefreshHook();
  }, [forceRefreshHook]);

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
        <div className="sub-nav-controls">
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
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
              <path
                d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
              />
            </svg>
          </button>
        </div>
        <div className="ai-info-container">
          <span className="ai-badge">AI Generated Content</span>
          <span className="disclaimer">Powered by Google Gemini</span>
        </div>
      </div>
      <div id="stock-content" className="content-area">
        <div className="analysis-container">
          <div className="analysis-section">
            <div className="analysis-section-header">
              <h4>Recent News Summary (Last 48 hours)</h4>
              <button onClick={handleForceRefresh} className="refresh-button" title="Refresh news summary">
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M480-160q-134 0-227-93t-93-227q0-134 93-227t227-93q69 0 132 28.5T720-690v-110h80v280H520v-80h168q-32-56-87.5-88T480-720q-100 0-170 70t-70 170q0 100 70 170t170 70q77 0 139-44t87-116h84q-28 106-114 173t-196 67Z"/></svg>
              </button>
            </div>
            {isLoading && <p className="loading-text">Generating news summary for {selectedStock?.name}...</p>}
            {error && <p className="error-text">Error: {error}</p>}
            {!isLoading && localAnalysis && <MarkdownDisplay>{localAnalysis.news_summary}</MarkdownDisplay>}
          </div>
          <div className="analysis-section">
            <h4>Business Overview & Analysis</h4>
            {/* Content will be added here in the future */}
          </div>
          <p className="disclaimer">
            <i>
              AI-generated summary. Information may be inaccurate. Please verify with primary sources.
            </i>
          </p>
        </div>
      </div>
    </>
  );
}

export default StockTrackerPage;