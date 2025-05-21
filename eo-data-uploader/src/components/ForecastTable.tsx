import React, { useState } from "react";
import "./../App.css";

const ForecastTable = ({ forecast }) => {
  const [show, setShow] = useState(false);

  // Sort descending by forecasted value (yhat) and take top 5
  const topForecasts = [...forecast]
    .sort((a, b) => b.yhat - a.yhat)
    .slice(0, 5);

  return (
    <>
      <div className="toggle-table" onClick={() => setShow(!show)}>
        {show ? "Hide Raw Forecast Table" : "Show Top 5 Forecasted Days"}
      </div>
      {show && (
        <table className="table-raw">
          <thead>
            <tr>
              <th>Date</th>
              <th>Forecasted Usage (MiB)</th>
            </tr>
          </thead>
          <tbody>
            {topForecasts.map((entry) => (
              <tr key={entry.date}>
                <td>{entry.date}</td>
                <td>{Math.round(entry.yhat).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
};

export default ForecastTable;
