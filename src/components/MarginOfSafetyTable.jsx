import './MarginOfSafetyTable.css';

function MarginOfSafetyTable({ intrinsicValue }) {
  const margins = [10, 20, 30, 40, 50];

  return (
    <div className="mos-table-container">
      <table className="mos-table">
        <thead>
          <tr>
            <th>Margin of Safety</th>
            <th>Target Buy Price</th>
          </tr>
        </thead>
        <tbody>
          {margins.map((mos) => {
            const targetPrice = intrinsicValue * (1 - mos / 100);
            return (
              <tr key={mos}>
                <td>{mos}%</td>
                <td>{targetPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default MarginOfSafetyTable;