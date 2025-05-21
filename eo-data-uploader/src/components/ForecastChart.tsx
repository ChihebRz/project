import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const ForecastChart = ({ forecast }) => {
  if (!forecast || !forecast.length) return null;

  const labels = forecast.map((d) => d.date);
  const values = forecast.map((d) => d.yhat);

  const data = {
    labels,
    datasets: [
      {
        label: "Forecasted Usage (MiB)",
        data: values,
        borderColor: "#36a2eb",
        backgroundColor: "#36a2eb",
        fill: false,
        tension: 0.3,
        pointRadius: 3,
        pointHoverRadius: 5,
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      tooltip: {
        callbacks: {
          label: (ctx) => `Forecasted Usage: ${Math.round(ctx.raw).toLocaleString()} MiB`
        }
      }
    },
    scales: {
      y: {
        ticks: {
          callback: (val) => val.toLocaleString(),
        }
      }
    }
  };

  return (
    <div style={{ marginBottom: 30 }}>
      <Line data={data} options={options} />
    </div>
  );
};

export default ForecastChart;
