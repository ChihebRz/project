import React from "react";
import "./../App.css";

const StatusCard = ({ status, cutDate, provisioned }) => {
  const isRisk = status === "risk";

  return (
    <div className="status-row">
      <div className="status-left">
        <span className={`badge ${isRisk ? "badge-risk" : "badge-safe"}`}>
          {isRisk ? "AT RISK" : "SAFE"}
        </span>
        {cutDate && (
          <span className="cutoff-text">
            Cutoff Date: <b>{cutDate}</b>
          </span>
        )}
      </div>
      <div className="status-right">
        Provisioned: <b>{provisioned.toLocaleString()} MiB</b>
      </div>
    </div>
  );
};

export default StatusCard;
