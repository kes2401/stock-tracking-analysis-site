import './CagrTable.css';

function CagrTable({ buyPrices, futureStockPrice, projectionYears }) {
  const calculateCagr = (buyPrice) => {
    if (!buyPrice || buyPrice <= 0 || !futureStockPrice || futureStockPrice <= 0 || !projectionYears || projectionYears <= 0) {
      return null;
    }
    const cagr = (Math.pow(futureStockPrice / buyPrice, 1 / projectionYears) - 1) * 100;
    return cagr;
  };

  return (
    <div className="cagr-table-container">
      <table className="cagr-table">
        <thead>
          <tr>
            <th>Buy Price</th>
            <th>% CAGR</th>
          </tr>
        </thead>
        <tbody>
          {buyPrices.map(({ label, price }) => {
            const cagr = calculateCagr(price);
            return (
              <tr key={label}>
                <td>
                  <span className="buy-price-label">{label}</span>
                  <span className="buy-price-value">{price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </td>
                <td>{cagr !== null ? `${cagr.toFixed(2)}%` : 'N/A'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default CagrTable;