import { useMemo, useCallback } from 'react';
import GaugeChart from '../components/GaugeChart.jsx';
import RechartsLineChart from '../components/RechartsLineChart.jsx';
import useCachedFetch from './useCachedFetch.js';
import './FearAndGreedPage.css';

const API_URL = 'https://production.dataviz.cnn.io/index/fearandgreed/graphdata';
const CACHE_KEY = 'fearAndGreedData';
const ONE_HOUR_MS = 3600 * 1000;

function FearAndGreedPage() {
  const fetcher = useCallback(async () => {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }, []);

  const { data, isLoading, error } = useCachedFetch(CACHE_KEY, fetcher, ONE_HOUR_MS);

  const lastUpdated = useMemo(() => {
    const cachedItem = localStorage.getItem(CACHE_KEY);
    return cachedItem ? new Date(JSON.parse(cachedItem).timestamp) : null;
  }, [data]);

  if (isLoading) {
    return <div className="status-message">Loading Fear & Greed Index...</div>;
  }

  if (error) {
    return <div className="status-message error">Error fetching data: {error}</div>;
  }

  if (!data) {
    return <div className="status-message">No data available.</div>;
  }

  const { score, rating } = data.fear_and_greed;
  const { previous_close, previous_1_week, previous_1_month, previous_1_year } = data.fear_and_greed;

  const sp500ApiData = data.market_momentum_sp500.data;
  const movingAvgApiData = data.market_momentum_sp125.data;

  // Create a map for quick lookup of moving average values by timestamp
  const movingAvgMap = new Map(movingAvgApiData.map(p => [p.x, p.y]));

  // Pre-process and merge data for the line chart.
  const marketMomentumData = sp500ApiData
    .filter(point => point.y !== null && !isNaN(point.y)) // Ensure S&P value is valid
    .map(point => {
      const maValue = movingAvgMap.get(point.x);
      return {
        x: point.x,
        y: Number(point.y),
        moving_average: maValue === null || isNaN(maValue) ? undefined : Number(maValue),
      };
    });

  return (
    <div className="fear-and-greed-container">
      <h2>Fear & Greed Index</h2>
      <p className="description">
        The Fear & Greed Index is a way to gauge stock market movements and whether stocks are fairly priced. The theory is based on the logic that excessive fear can result in stocks trading well below their intrinsic values and that unbridled greed can result in stocks being bid up far above what they should be worth.
      </p>
      <GaugeChart score={score} rating={rating} />
      <div className="historical-data">
        <div className="historical-item">
          <span className="label">Previous Close</span>
          <span className="value">{previous_close.toFixed(0)}</span>
        </div>
        <div className="historical-item">
          <span className="label">1 Week Ago</span>
          <span className="value">{previous_1_week.toFixed(0)}</span>
        </div>
        <div className="historical-item">
          <span className="label">1 Month Ago</span>
          <span className="value">{previous_1_month.toFixed(0)}</span>
        </div>
        <div className="historical-item">
          <span className="label">1 Year Ago</span>
          <span className="value">{previous_1_year.toFixed(0)}</span>
        </div>
      </div>
      <div className="market-momentum-section">
        <h3 className="chart-title">Market Momentum: S&P 500 vs 125-Day Average</h3>
        <RechartsLineChart data={marketMomentumData} />
      </div>
      {lastUpdated && (
        <div className="last-updated-container">
          <p className="last-updated-text">
            Last updated: {lastUpdated.toLocaleString()}
          </p>
          <p className="data-source-text">
            Data source: <a href="https://edition.cnn.com/markets/fear-and-greed" target="_blank" rel="noopener noreferrer">CNN Business</a>
          </p>
        </div>
      )}
    </div>
  );
}

export default FearAndGreedPage;