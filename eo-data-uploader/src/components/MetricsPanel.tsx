import React from "react";

const MetricsPanel = ({ data }) => {
  return (
    <div style={{ marginTop: 10, marginBottom: 20 }}>
      <h4> Forecast Metrics</h4>
      <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
        <li><b>VM:</b> {data.vm}</li>
        {data.status === "safe" && (
          <li><b>Estimated Days to Saturation:</b> {data.estimated_days_to_cut}</li>
        )}
      </ul>
    </div>
  );
};

export default MetricsPanel;
