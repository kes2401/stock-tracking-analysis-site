import { useState, useEffect } from 'react';
import GaugeChart from '../components/GaugeChart.jsx';
import './FearAndGreedPage.css';

const API_URL = 'https://production.dataviz.cnn.io/index/fearandgreed/graphdata';

function FearAndGreedPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check for cached data
        const cachedData = localStorage.getItem('fearAndGreedData');
        const cachedTimestamp = localStorage.getItem('fearAndGreedTimestamp');

        if (cachedData && cachedTimestamp) {
          const timestamp = parseInt(cachedTimestamp, 10);
          setLastUpdated(new Date(timestamp));
          const age = Date.now() - timestamp;
          // Use cache if it's less than 1 hour old
          if (age < 3600000) {
            setData(JSON.parse(cachedData));
            setLoading(false);
            return;
          }
        }

        // Fetch new data
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        setData(result);
        const newTimestamp = Date.now();
        setLastUpdated(new Date(newTimestamp));

        // Cache the new data and timestamp
        localStorage.setItem('fearAndGreedData', JSON.stringify(result));
        localStorage.setItem('fearAndGreedTimestamp', newTimestamp.toString());
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="status-message">Loading Fear & Greed Index...</div>;
  }

  if (error) {
    return <div className="status-message error">Error fetching data: {error}</div>;
  }

  if (!data) {
    return <div className="status-message">No data available.</div>;
  }

  const { score, rating, previous_close, previous_1_week, previous_1_month, previous_1_year } = data.fear_and_greed;

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
      {lastUpdated && (
        <div className="last-updated-container">
          <p className="last-updated-text">
            Last updated: {lastUpdated.toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}

export default FearAndGreedPage;