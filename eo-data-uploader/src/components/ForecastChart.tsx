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
  ChartOptions,
} from "chart.js";

// Register components
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

// Define prop types
type ForecastEntry = {
  date: string;
  yhat: number;
};

type ForecastChartProps = {
  forecast: ForecastEntry[];
  provisioned: number;
};

const ForecastChart: React.FC<ForecastChartProps> = ({ forecast, provisioned }) => {
  if (!forecast || forecast.length === 0) return null;

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
      },
      
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    plugins: {
      legend: {
        position: "top", // ✅ casted to the correct literal type
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const label = ctx.dataset.label || "";
            return `${label}: ${Math.round(Number(ctx.raw)).toLocaleString()} MiB`;
          },
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: (val: string | number) => Number(val).toLocaleString(),
        },
        title: {
          display: true,
          text: "Disk Space (MiB)",
        },
      },
      x: {
        title: {
          display: true,
          text: "Date",
        },
      },
    },
  };

  return (
    <div style={{ marginBottom: 30 }}>
      <Line data={data} options={options} />
    </div>
  );
};

export default ForecastChart;
