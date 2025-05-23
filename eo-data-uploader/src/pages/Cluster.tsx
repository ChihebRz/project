import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './cluster.css'; // ✅ Make sure this file exists in the same folder or adjust path
import ClusterAnalysis from '../components/ClusterAnalysis';
import MainLayout from '@/components/Layout/MainLayout';

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
    <MainLayout>
      <div className="container">
        <h1 className="title">🧠 VM Resource Cluster Predictor</h1>

        {/* New layout: Manual Input and VM Selector side by side, Cluster Analysis below */}
        <div className="top-panels">
          {/* Manual Input Card */}
          <div className="left-panel">
            <div className="card">
              <div className="card-header manual">
                <span className="icon">{String.fromCodePoint(0x1F4BB)}</span>
                Entrée Manuelle
              </div>
              <form className="manual-form" onSubmit={e => { e.preventDefault(); predictCluster(); }}>
                <div className="manual-grid">
                  {[
                    { key: 'cpu', label: 'CPU' },
                    { key: 'memory', label: 'MEMORY' },
                    { key: 'nics', label: 'NICS' },
                    { key: 'disks', label: 'DISKS' },
                    { key: 'in_use_mib', label: 'IN USE MIB' },
                    { key: 'sockets', label: 'SOCKETS' },
                    { key: 'cores_per_socket', label: 'CORES PER SOCKET' },
                    { key: 'capacity_mib', label: 'CAPACITY MIB' },
                    { key: 'provisioned_mib', label: 'PROVISIONED MIB' },
                  ].map(({ key, label }) => (
                  <div key={key} className="input-group">
                    <label>{label}</label>
                    <input
                      type="number"
                      value={resources[key as keyof typeof resources]}
                      onChange={(e) => handleManualChange(key, e.target.value)}
                    />
                  </div>
                ))}
                </div>
                <button className="primary" type="submit">Prédire le Cluster</button>
              </form>
            </div>
          </div>
          {/* VM Selector Card */}
          <div className="middle-panel">
            <div className="card">
              <div className="card-header selector">
                <span className="icon">{String.fromCodePoint(0x1F5C3)}</span>
                Sélectionner une VM
              </div>
              <form className="selector-form" onSubmit={e => { e.preventDefault(); analyzeVM(); }}>
                <label htmlFor="vm-select">Machines Virtuelles</label>
                <select id="vm-select" value={selectedVM} onChange={(e) => setSelectedVM(e.target.value)}>
                  <option value="">-- Sélectionner une VM --</option>
                  {vms.map((vm, i) => (
                    <option key={i} value={vm.VM}>{vm.VM}</option>
                  ))}
                </select>
                <button className="analyze-btn" type="submit" disabled={!selectedVM}>Analyser la VM</button>
              </form>
            </div>
          </div>
          {/* Prediction Result Card */}
          <div className="right-panel">
            <div className="card">
              <div className="card-header prediction">
                <span className="icon">{String.fromCodePoint(0x1F4C8)}</span>
                Résultat de Prédiction
              </div>
              <div className="prediction-panel">
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
                  <p className="muted">Aucune prédiction. Utilisez l'entrée manuelle ou sélectionnez une VM.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Cluster Analysis below, full width */}
        <div className="bottom-panel">
          <ClusterAnalysis />
        </div>
      </div>
    </MainLayout>
  );
};

export default Cluster;
