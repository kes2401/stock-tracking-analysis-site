import './GaugeChart.css';

const GaugeChart = ({ score, rating }) => {
  // The needle rotates from -90deg (score 0) to +90deg (score 100)
  const rotation = (score / 100) * 180 - 90;

  const getRatingClass = (ratingText) => {
    return ratingText.toLowerCase().replace(/\s+/g, '-');
  };

  // SVG path for a circular arc segment
  const describeArc = (x, y, radius, startAngle, endAngle) => {
    const start = {
      x: x + radius * Math.cos(startAngle),
      y: y + radius * Math.sin(startAngle)
    };
    const end = {
      x: x + radius * Math.cos(endAngle),
      y: y + radius * Math.sin(endAngle)
    };
    const largeArcFlag = endAngle - startAngle <= Math.PI ? "0" : "1";
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
  };

  const segments = [
    { class: 'arc-extreme-fear', start: 0, end: 25 },
    { class: 'arc-fear', start: 25, end: 45 },
    { class: 'arc-neutral', start: 45, end: 55 },
    { class: 'arc-greed', start: 55, end: 75 },
    { class: 'arc-extreme-greed', start: 75, end: 100 },
  ];

  const labels = [
    { text: 'Extreme Fear', position: 12.5 },
    { text: 'Fear', position: 35 },
    { text: 'Neutral', position: 50 },
    { text: 'Greed', position: 65 },
    { text: 'Extreme Greed', position: 87.5 },
  ];

  return (
    <div className="gauge-container">
      <svg viewBox="0 0 200 120" className="gauge-svg">
        {/* Gauge Arcs */}
        {segments.map(segment => (
          <path
            key={segment.class}
            className={`gauge-arc ${segment.class}`}
            d={describeArc(100, 100, 80, (segment.start / 100) * Math.PI - Math.PI, (segment.end / 100) * Math.PI - Math.PI)}
          />
        ))}

        {/* Invisible path for text to follow */}
        <path id="gauge-text-path" d={describeArc(100, 100, 90, -Math.PI, 0)} fill="none" />

        {/* Arc Labels */}
        <text className="gauge-labels">
          {labels.map(label => (
            <textPath key={label.text} href="#gauge-text-path" startOffset={`${label.position}%`} textAnchor="middle">
              {label.text}
            </textPath>
          ))}
        </text>

        {/* Needle */}
        <g className="gauge-needle-group" style={{ transform: `rotate(${rotation}deg)` }}>
          <path className="gauge-needle" d="M 100 25 L 97 100 L 103 100 Z" />
          <circle className="gauge-center" cx="100" cy="100" r="5" />
        </g>

        {/* Readout Text */}
        <text x="100" y="85" className="gauge-score">{score.toFixed(0)}</text>
        <text x="100" y="100" className={`gauge-rating ${getRatingClass(rating)}`}>{rating}</text>
      </svg>
    </div>
  );
};

export default GaugeChart;