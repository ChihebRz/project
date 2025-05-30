import React, { useEffect, useState } from "react";
import axios from "axios";
import ForecastChart from "../components/ForecastChart";
import StatusCard from "../components/StatusCard";
import MetricsPanel from "../components/MetricsPanel";
import ForecastTable from "../components/ForecastTable";
import Dashboard from "../components/Dashboard";
import MainLayout from "@/components/Layout/MainLayout";
import "./Forecast.css";

const DEFAULT_VM = "Aos_Server";

type ForecastEntry = {
  date: string;
  yhat: number;
};

type ForecastResponse = {
  vm: string;
  best_model: string;
  rmse: number;
  mae: number;
  provisioned_mib: number;
  cut_date: string | null;
  status: "safe" | "risk" | "unknown";
  estimated_days_to_cut: number | null;
  forecast: ForecastEntry[];
};

const Forecast: React.FC = () => {
  const [tab, setTab] = useState<"dashboard" | "vm">("dashboard");
  const [vmList, setVmList] = useState<string[]>([]);
  const [selectedVM, setSelectedVM] = useState<string>(DEFAULT_VM);
  const [forecastData, setForecastData] = useState<ForecastResponse | null>(null);
  const [error, setError] = useState<string>("");

  const API_URL = "http://localhost:4000/api";

  useEffect(() => {
    axios
      .get<string[]>(`${API_URL}/forecast/vms`)
      .then((res) => {
        setVmList(res.data);
        if (res.data.includes(DEFAULT_VM)) {
          fetchForecast(DEFAULT_VM);
        }
      })
      .catch(() => setError("⚠️ Failed to load VM list"));
  }, []);

  const fetchForecast = async (vm: string) => {
    setError("");
    setForecastData(null);
    try {
      const res = await axios.get<ForecastResponse>(`${API_URL}/forecast?vm=${vm}`);
      setForecastData(res.data);
    } catch {
      setError("⚠️ Error fetching forecast data");
    }
  };

  const handleSelect = (vm: string) => {
    setSelectedVM(vm);
    fetchForecast(vm);
    setTab("vm");
  };

  return (
    <MainLayout>
      <div className="forecast-page">
        <div className="tabs">
          <button
            className={tab === "dashboard" ? "active-tab" : ""}
            onClick={() => setTab("dashboard")}
          >
            🧭 Tableau de bord
          </button>
          <button
            className={tab === "vm" ? "active-tab" : ""}
            onClick={() => setTab("vm")}
          >
            🖥️ Prévision VM
          </button>
        </div>

        {tab === "dashboard" && <Dashboard />}

        {tab === "vm" && (
          <div className="vm-forecast">
            <h2>📊 VM Disk Usage Forecast</h2>

            <select value={selectedVM} onChange={(e) => handleSelect(e.target.value)}>
              <option value="">Select VM...</option>
              {vmList.map((vm) => (
                <option key={vm} value={vm}>
                  {vm}
                </option>
              ))}
            </select>

            {error && <p style={{ color: "red" }}>{error}</p>}

            {forecastData?.forecast?.length > 0 ? (
              <>
                <StatusCard
                  status={forecastData.status}
                  cutDate={forecastData.cut_date}
                  provisioned={forecastData.provisioned_mib}
                />
                <MetricsPanel data={forecastData} />
                <ForecastChart
                  forecast={forecastData.forecast}
                  provisioned={forecastData.provisioned_mib}
                />
                <ForecastTable forecast={forecastData.forecast} />
              </>
            ) : forecastData && forecastData.forecast?.length === 0 ? (
              <p>⚠️ No forecast available for this VM.</p>
            ) : null}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Forecast;
