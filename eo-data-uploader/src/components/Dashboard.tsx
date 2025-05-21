import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Dashboard.css";

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const API = "http://localhost:4000/api/forecast/all";

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API);
      const vms = res.data || [];
      const sorted = vms.sort((a, b) => {
        if (a.status === "risk" && b.status !== "risk") return -1;
        if (a.status !== "risk" && b.status === "risk") return 1;
        return 0;
      });
      setData(sorted);
      setFiltered(sorted);
    } catch (err) {
      console.error("Error loading dashboard data", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const safeCount = data.filter(vm => vm.status === "safe").length;
  const riskCount = data.filter(vm => vm.status === "risk").length;

  const avgProvisioned = Math.round(
    data.reduce((sum, vm) => sum + (vm.provisioned_mib || 0), 0) / data.length || 0
  );

  const closest = data
    .filter(vm => vm.estimated_days_to_cut)
    .sort((a, b) => a.estimated_days_to_cut - b.estimated_days_to_cut)
    .slice(0, 2);

  const handleSearch = (e) => {
    const val = e.target.value.toLowerCase();
    setSearch(val);

    const filteredData = data.filter(vm =>
      vm.vm.toLowerCase().includes(val) ||
      (vm.status && vm.status.toLowerCase().includes(val))
    );

    const sorted = filteredData.sort((a, b) => {
      if (a.status === "risk" && b.status !== "risk") return -1;
      if (a.status !== "risk" && b.status === "risk") return 1;
      return 0;
    });

    setFiltered(sorted);
  };

  return (
    <div className="dashboard-container">
      <h2>⚙️ VM Risk Dashboard</h2>

      {loading ? <p>Loading...</p> : (
        <>
          <div className="summary">
            <div>
              <h4>Average Provisioned MiB</h4>
              <div className="summary-value">{avgProvisioned.toLocaleString()} MiB</div>
            </div>

            <div>
              <h4>Status</h4>
              <div>
                <span className="badge safe">SAFE</span> {safeCount} &nbsp;→&nbsp;
                <span className="badge risk">AT RISK</span> {riskCount}
              </div>
            </div>

            <div>
              <h4>Closest to Saturation</h4>
              {closest.map((vm, i) => (
                <div key={vm.vm}>
                  {i + 1}. <strong>{vm.vm}</strong> {vm.estimated_days_to_cut} days
                </div>
              ))}
            </div>
          </div>

          <div className="vm-table">
            <input
              type="text"
              placeholder="Search by VM or status..."
              value={search}
              onChange={handleSearch}
            />
            <button onClick={fetchData}>🔁 Refresh</button>

            <table>
              <thead>
                <tr>
                  <th>VM Name</th>
                  <th>Status</th>
                  <th>Cutoff Date</th>
                  <th>Days to Saturation</th>
                  <th>Provisioned MiB</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(vm => (
                  <tr key={vm.vm} className={vm.status === "risk" ? "row-risk" : ""}>
                    <td>{vm.vm}</td>
                    <td>
                      <span className={`badge ${vm.status}`}>
                        {vm.status === "risk" ? "AT RISK" : "SAFE"}
                      </span>
                    </td>
                    <td>{vm.cut_date || "—"}</td>
                    <td>{vm.estimated_days_to_cut ? `${vm.estimated_days_to_cut} days` : "—"}</td>
                    <td>{vm.provisioned_mib?.toLocaleString() || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
