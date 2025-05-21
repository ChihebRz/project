import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './cluster.css'; // ✅ Make sure this file exists in the same folder or adjust path
import ClusterAnalysis from '../components/ClusterAnalysis';
const Cluster = () => {
  const [mode, setMode] = useState<'manual' | 'selector' | 'analysis'>('manual');

  const [resources, setResources] = useState({
    cpu: 2,
    memory: 4,
    nics: 1,
    disks: 1,
    in_use_mib: 50000,
    sockets: 2,
    cores_per_socket: 2,
    capacity_mib: 50000,
    provisioned_mib: 8192
  });

  const [prediction, setPrediction] = useState('');
  const [clusterLabel, setClusterLabel] = useState<number | null>(null);
  const [vmClusterMessage, setVmClusterMessage] = useState('');
  const [vms, setVms] = useState<{ VM: string }[]>([]);
  const [selectedVM, setSelectedVM] = useState('');

  const CLUSTER_EXPLANATIONS: { [key: number]: string } = {
    0: "🟢 Cluster 0 : VMs de Production Standard — ~16 Go RAM, ~5 CPU, ~275 Go disque provisionné.",
    1: "🔵 Cluster 1 : VM Exceptionnelle — ~12 Go RAM, 4 CPU mais ~39 To de stockage !",
    2: "🟡 Cluster 2 : VMs Critiques / Intensives — ~138 Go RAM, ~32 CPU, ~2.2 To disque."
  };

  useEffect(() => {
    axios.get('http://localhost:5000/vms')
      .then(res => setVms(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleManualChange = (key: string, value: string) => {
    setResources({ ...resources, [key]: Number(value) });
  };

  const predictCluster = () => {
    setVmClusterMessage('');
    axios.post('http://localhost:5000/predict', resources)
      .then((res) => {
        setPrediction(res.data.message);
        setClusterLabel(res.data.clusterLabel);
      })
      .catch((err) => console.error("Prediction error:", err));
  };

  const analyzeVM = () => {
    axios.get(`http://localhost:5000/vm/${selectedVM}`)
      .then(res => {
        const {
          CPUs, Memory, NICs, Disks,
          In_Use_MiB, Sockets, Cores_p_s,
          Capacity_MiB, Provisioned_MiB
        } = res.data;

        return axios.post('http://localhost:5000/predict', {
          cpu: CPUs, memory: Memory, nics: NICs, disks: Disks,
          in_use_mib: In_Use_MiB, sockets: Sockets,
          cores_per_socket: Cores_p_s,
          capacity_mib: Capacity_MiB,
          provisioned_mib: Provisioned_MiB
        });
      })
      .then(res => {
        setPrediction(res.data.message);
        setClusterLabel(res.data.clusterLabel);
        setVmClusterMessage(`✅ La VM "${selectedVM}" appartient au Cluster ${res.data.clusterLabel}.`);
      })
      .catch(err => console.error("VM analysis error:", err));
  };

  return (
    <div className="container">
      <h1 className="title">🧠 VM Resource Cluster Predictor</h1>

      <div className="tabs">
        <button className={mode === 'manual' ? 'active' : ''} onClick={() => setMode('manual')}>
          Manual Input
        </button>
        <button className={mode === 'selector' ? 'active' : ''} onClick={() => setMode('selector')}>
          VM Selector
        </button>
        <button className={mode === 'analysis' ? 'active' : ''} onClick={() => setMode('analysis')}>
          Cluster Analysis
        </button>
      </div>

      <div className="main-content">
        {mode === 'analysis' ? (
          <ClusterAnalysis />
        ) : (
          <>
            <div className="left-panel">
              {mode === 'manual' ? (
                <div className="card">
                  <h2>Manual Input</h2>
                  {[
                    'cpu', 'memory', 'nics', 'disks', 'in_use_mib',
                    'sockets', 'cores_per_socket', 'capacity_mib', 'provisioned_mib'
                  ].map((key) => (
                    <div key={key} className="input-group">
                      <label>{key.replace(/_/g, ' ').toUpperCase()}</label>
                      <input
                        type="number"
                        value={resources[key as keyof typeof resources]}
                        onChange={(e) => handleManualChange(key, e.target.value)}
                      />
                    </div>
                  ))}
                  <button className="primary" onClick={predictCluster}>🔍 Predict Cluster</button>
                </div>
              ) : (
                <div className="card">
                  <h2>Select VM</h2>
                  <select value={selectedVM} onChange={(e) => setSelectedVM(e.target.value)}>
                    <option value="">-- Choose a VM --</option>
                    {vms.map((vm, i) => (
                      <option key={i} value={vm.VM}>{vm.VM}</option>
                    ))}
                  </select>
                  <button className="primary" onClick={analyzeVM} disabled={!selectedVM}>Analyze</button>
                </div>
              )}
            </div>

            <div className="right-panel">
              <div className="card">
                <h2>Prediction Result</h2>
                {vmClusterMessage && (
                  <div className="cluster-message success">{vmClusterMessage}</div>
                )}
                {prediction ? (
                  <>
                    <p className="prediction">{prediction}</p>
                    {clusterLabel !== null && CLUSTER_EXPLANATIONS[clusterLabel] && (
                      <div className="cluster-info">{CLUSTER_EXPLANATIONS[clusterLabel]}</div>
                    )}
                  </>
                ) : (
                  <p className="muted">No prediction yet.</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cluster;
