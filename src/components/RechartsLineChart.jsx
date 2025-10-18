import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const RechartsLineChart = ({ data }) => {
  // Formatter for the X-axis (date) to display 'Mon Year'
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  };

  // Formatter for the Y-axis (value) to display as a whole number
  const formatValue = (value) => {
    return value.toLocaleString('en-US', { maximumFractionDigits: 0 });
  };

  // Formatter for the tooltip to show 2 decimal places and comma separators
  const formatTooltipValue = (value) => {
    if (typeof value === 'number') {
      return value.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
    return value;
  };
  return (
    <div className="line-chart-container">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 20,
            left: -10, // Adjust to bring labels closer to the axis
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
          <XAxis
            dataKey="x"
            tickFormatter={formatDate}
            tick={{ fill: 'var(--on-surface-secondary-color)', fontSize: 12 }}
            axisLine={{ stroke: 'var(--border-color)' }}
            tickLine={{ stroke: 'var(--border-color)' }}
          />
          <YAxis
            tickFormatter={formatValue}
            tick={{ fill: 'var(--on-surface-secondary-color)', fontSize: 12 }}
            axisLine={{ stroke: 'var(--border-color)' }}
            tickLine={{ stroke: 'var(--border-color)' }}
            domain={['dataMin - 100', 'dataMax + 100']} // Add padding to the domain
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--surface-color)',
              borderColor: 'var(--border-color)',
            }}
            formatter={formatTooltipValue}
            labelFormatter={formatDate}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="y"
            name="S&P 500"
            stroke="#8ab4f8"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="moving_average"
            name="125-Day Moving Average"
            stroke="#f57c00"
            strokeWidth={2}
            dot={false}
            connectNulls={true} // This is the key to handling the initial null values
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RechartsLineChart;