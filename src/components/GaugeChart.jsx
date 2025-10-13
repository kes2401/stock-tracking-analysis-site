import './GaugeChart.css';

const GaugeChart = ({ score, rating }) => {
  // The needle rotates from -90deg (0) to +90deg (100)
  const rotation = (score / 100) * 180 - 90;

  const getRatingClass = (ratingText) => {
    return ratingText.toLowerCase().replace(/\s+/g, '-');
  };

  return (
    <div className="gauge-container">
      <div className="gauge">
        <div className="gauge-dial">
          <div className="gauge-arc arc-extreme-fear"></div>
          <div className="gauge-arc arc-fear"></div>
          <div className="gauge-arc arc-neutral"></div>
          <div className="gauge-arc arc-greed"></div>
          <div className="gauge-arc arc-extreme-greed"></div>
          <div className="gauge-center"></div>
          <div
            className="gauge-needle"
            style={{ transform: `rotate(${rotation}deg)` }}
          ></div>
        </div>
        <div className="gauge-labels">
          <span>Extreme Fear</span>
          <span>Neutral</span>
          <span>Extreme Greed</span>
        </div>
      </div>
      <div className="gauge-readout">
        <div className={`gauge-rating ${getRatingClass(rating)}`}>{rating}</div>
        <div className="gauge-score">{score.toFixed(0)}</div>
      </div>
    </div>
  );
};

export default GaugeChart;