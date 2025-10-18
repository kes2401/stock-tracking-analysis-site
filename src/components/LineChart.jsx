import { useMemo } from 'react';
import './LineChart.css';

const LineChart = ({ data, width = 600, height = 300 }) => {
  const { points1, movingAveragePath, yAxisLabels, xAxisLabels } = useMemo(() => {
    // Filter out any data points that don't have a valid S&P 500 value.
    const dataWithSP500 = data ? data.filter(d => d.y !== null && !isNaN(d.y)) : [];

    if (dataWithSP500.length === 0) {
      return { points1: '', movingAveragePath: '', yAxisLabels: [], xAxisLabels: [] };
    }

    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const sp500Values = dataWithSP500.map(d => d.y);
    const movingAverageValues = dataWithSP500.map(d => d.moving_average).filter(v => v !== null && !isNaN(v));

    if (sp500Values.length === 0) {
      return { points1: '', movingAveragePath: '', yAxisLabels: [], xAxisLabels: [] };
    }

    // Base the scale on all available values from both datasets
    const allValues = sp500Values.concat(movingAverageValues);

    let dataMin = Math.min(...allValues);
    let dataMax = Math.max(...allValues);

    // Add padding and prevent division by zero if all values are the same
    const range = dataMax - dataMin;
    if (range === 0) {
      // Handle case where all data points are the same
      dataMin -= 5;
      dataMax += 5;
    }
    const yMin = dataMin - range * 0.05;
    const yMax = dataMax + range * 0.05;

    const xMin = dataWithSP500[0].x;
    const xMax = dataWithSP500[dataWithSP500.length - 1].x;

    const getX = (x) => {
      const xRange = xMax - xMin;
      if (xRange === 0) return padding; // Handle case with a single data point
      return padding + ((x - xMin) / xRange) * chartWidth;
    };
    const getY = (y) => {
      const yRange = yMax - yMin;
      // Prevent division by zero if all values are the same
      if (yRange === 0) return padding + chartHeight / 2;
      return padding + chartHeight - ((y - yMin) / yRange) * chartHeight;
    };

    // The S&P 500 line can be plotted for the whole range
    const points1 = dataWithSP500.map(d => `${getX(d.x)},${getY(d.y)}`).join(' ');

    const validDataForMA = dataWithSP500.filter(d => d.moving_average !== null && !isNaN(d.moving_average));
    const movingAveragePath = validDataForMA.length > 0
      ? `M ${getX(validDataForMA[0].x)} ${getY(validDataForMA[0].moving_average)} ` +
        validDataForMA.slice(1).map(d => `L ${getX(d.x)} ${getY(d.moving_average)}`).join(' ')
      : '';


    // Generate Y-axis labels
    const yLabelCount = 5;
    const yAxisLabels = [];
    for (let i = 0; i <= yLabelCount; i++) {
      const value = yMin + (i / yLabelCount) * (yMax - yMin);
      yAxisLabels.push({
        y: getY(value),
        label: value.toLocaleString('en-US', { maximumFractionDigits: 0 }),
      });
    }

    // Generate X-axis labels
    const xLabelCount = 4;
    const xAxisLabels = [];
    for (let i = 0; i <= xLabelCount; i++) {
      const index = Math.floor((i / xLabelCount) * (dataWithSP500.length - 1));
      const point = dataWithSP500[index];
      xAxisLabels.push({
        x: getX(point.x),
        label: new Date(point.x).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      });
    }

    return { points1, movingAveragePath, yAxisLabels, xAxisLabels };
  }, [data, width, height]);

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <div className="line-chart-container">
      <svg viewBox={`0 0 ${width} ${height}`} className="line-chart-svg">
        {/* Y-axis grid lines and labels */}
        {yAxisLabels.map((item, i) => (
          <g key={i} className="grid-line">
            <line x1="40" y1={item.y} x2={width - 40} y2={item.y} />
            <text x="35" y={item.y} dy="0.32em" textAnchor="end">
              {item.label}
            </text>
          </g>
        ))}

        {/* X-axis labels */}
        {xAxisLabels.map((item, i) => (
          <text key={i} x={item.x} y={height - 20} textAnchor="middle">
            {item.label}
          </text>
        ))}

        {/* S&P 500 Line */}
        <polyline
          className="line sp500-line"
          fill="none"
          points={points1}
        />

        {/* Moving Average Line */}
        <path
          className="line moving-average-line"
          fill="none"
          d={movingAveragePath}
        />
      </svg>
      <div className="chart-legend">
        <div className="legend-item">
          <span className="legend-color sp500-color"></span>
          S&P 500
        </div>
        <div className="legend-item">
          <span className="legend-color moving-average-color"></span>
          125-Day Moving Average
        </div>
      </div>
    </div>
  );
};

export default LineChart;