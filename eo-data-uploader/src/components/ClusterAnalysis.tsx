// src/components/ClusterAnalysis.js
import React, { useState } from 'react';
import './ClusterAnalysis.css';

const clusters = [
  {
    id: 0,
    color: 'green',
    bg: '#f0fcf5',
    badge: 'Cluster 0',
    icon: '🖥️',
    title: "VMs de Production Standard",
    subtitle: "VMs équilibrées, très répandues",
    details: "1125 VMs (majorité)",
    specs: [
      { label: 'RAM', value: '~16 Go' },
      { label: 'CPU', value: '~5 (2-4 cœurs)' },
      { label: 'Disque provisionné', value: '~275 Go' },
      { label: 'Utilisation mémoire', value: '~46%' },
      { label: 'Utilisation disque', value: '~81%' },
    ],
    usageTitle: "Cas d'usage typiques",
    usage: [
      "Serveurs web (Apache, NGINX, Tomcat)",
      "Petites applications métiers",
      "Services internes (authentification, monitoring)",
      "Environnements de tests légers"
    ],
    recTitle: "Recommandations Cluster 0",
    recommendations: [
      { icon: '✔️', text: "Bonne efficacité : ratio mémoire/disque bien équilibré." },
      { icon: '🛠️', text: "Optimisation possible : vérifier les VMs <50% RAM utilisée → possibilité de réduire la RAM." },
      { icon: '🤖', text: "Automation recommandée : ce groupe étant majoritaire, idéal pour standardiser les templates de déploiement." }
    ]
  },
  {
    id: 1,
    color: 'blue',
    bg: '#f3f8ff',
    badge: 'Cluster 1',
    icon: '⚠️',
    title: "VM Très Haute Capacité ou Anomalie",
    subtitle: "VM très rare mais surprovisionnée",
    details: "1 seule VM",
    specs: [
      { label: 'RAM', value: '12 Go (pas très élevé)' },
      { label: 'CPU', value: '4' },
      { label: 'Disque provisionné', value: '~39 To' },
      { label: 'Disque utilisé', value: '~35 To' },
      { label: 'Disk Usage Ratio', value: '44%' },
    ],
    usageTitle: "Cas d'usage probables",
    usage: [
      "Serveur NAS/SAN virtualisé (stockage réseau)",
      "VM utilisée pour sauvegardes centralisées",
      "Service d'archivage massif",
      "OU erreur de configuration"
    ],
    recTitle: "Recommandations Cluster 1",
    recommendations: [
      { icon: '⚠️', text: "Audit immédiat : valider l'usage réel de cette VM." },
      { icon: '⚠️', text: "Risque de SPOF (Single Point of Failure) : peut concentrer trop de données critiques sur un seul nœud." },
      { icon: '⚠️', text: "Surcoût potentiel : surveiller coût de stockage (RAID, backup, snapshot)." },
      { icon: '🛠️', text: "Migrer cette charge vers une solution dédiée si besoin (Ex: serveur de fichiers physique, stockage objet)." }
    ]
  },
  {
    id: 2,
    color: 'yellow',
    bg: '#fffbe7',
    badge: 'Cluster 2',
    icon: '🗄️',
    title: "VMs Surprovisionnées / Très Performantes",
    subtitle: "VMs critiques ou intensives",
    details: "32 VMs",
    specs: [
      { label: 'RAM', value: '~138 Go' },
      { label: 'CPU', value: '~32' },
      { label: 'Disque provisionné', value: '~2.1 To' },
      { label: 'Disk Usage Ratio', value: '~81%' },
      { label: 'Utilisation RAM', value: '58%' },
    ],
    usageTitle: "Cas d'usage typiques",
    usage: [
      "Serveurs de base de données haute disponibilité (PostgreSQL, Oracle RAC, MSSQL)",
      "Services analytiques (Hadoop, Spark)",
      "Modèles IA / Deep Learning",
      "Traitement de vidéos, Big Data, simulations scientifiques"
    ],
    recTitle: "Recommandations Cluster 2",
    recommendations: [
      { icon: '🛠️', text: "Surveiller les performances : monitorer la charge CPU/RAM pour garantir la qualité de service." },
      { icon: '🛠️', text: "Réserver ces machines à des usages réellement critiques." },
      { icon: '⚠️', text: "Coût élevé → limiter la prolifération de ce type de VM." },
      { icon: '🛠️', text: "Réduction possible si certaines VMs sont surprovisionnées (RAM > 120 Go mais faible usage)." }
    ]
  }
];

const ClusterAnalysis = () => {
  const [openClusters, setOpenClusters] = useState<{ [id: number]: boolean }>({ 0: true, 1: false, 2: false });

  const toggleCluster = (id: number) => {
    setOpenClusters((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="cluster-analysis-new">
      <h2 className="ca-title">Analyse des Clusters du Datacenter</h2>
      <p className="ca-subtitle">Analyse approfondie des trois clusters identifiés avec des cas d'usage concrets, des recommandations pratiques et des indicateurs stratégiques pour le datacenter.</p>
      {clusters.map(cluster => (
        <div key={cluster.id}>
          {/* Header row with expand/collapse */}
          <div className="ca-header-row" onClick={() => toggleCluster(cluster.id)}>
            <span className="ca-arrow">{openClusters[cluster.id] ? '▾' : '▸'}</span>
            <span className={`ca-badge ca-badge-${cluster.color}`}>{cluster.badge}</span>
            <span className="ca-header-title">{cluster.title}</span>
          </div>
          {/* Expanded content */}
          {openClusters[cluster.id] && (
            <div className="ca-row">
              {/* Left: Cluster Card */}
              <div className={`ca-card ca-card-left ca-bg-${cluster.color}`} style={{background: cluster.bg}}>
                <div className="ca-badge-row">
                  <span className={`ca-badge ca-badge-${cluster.color}`}>{cluster.badge}</span>
                  <span className="ca-icon">{cluster.icon}</span>
                </div>
                <div className="ca-card-title">{cluster.title}</div>
                <div className="ca-card-subtitle">{cluster.subtitle}</div>
                <div className="ca-card-details">{cluster.details}</div>
                <div className="ca-specs-row">
                  {cluster.specs.map((spec, i) => (
                    <div className="ca-spec" key={i}>
                      <div className="ca-spec-label">{spec.label}</div>
                      <div className="ca-spec-value">{spec.value}</div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Middle: Usage */}
              <div className="ca-card ca-card-middle">
                <div className="ca-section-title">{cluster.usageTitle}</div>
                <ul className="ca-usage-list">
                  {cluster.usage.map((item, i) => (
                    <li key={i}><span className="ca-usage-dot">•</span> {item}</li>
                  ))}
                </ul>
              </div>
              {/* Right: Recommendations */}
              <div className="ca-card ca-card-right">
                <div className="ca-section-title">{cluster.recTitle}</div>
                <ul className="ca-rec-list">
                  {cluster.recommendations.map((rec, i) => (
                    <li key={i}><span className="ca-rec-icon">{rec.icon}</span> {rec.text}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      ))}
      {/* Strategic Summary Table */}
      <div className="ca-summary-table-container">
        <table className="ca-summary-table">
          <thead>
            <tr>
              <th colSpan={3} className="ca-summary-title">Résumé Stratégique pour le Datacenter</th>
            </tr>
            <tr className="ca-summary-header-row">
              <th>Cluster</th>
              <th>Profil</th>
              <th>Actions Recommandées</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>0</td>
              <td>VMs classiques</td>
              <td>⚙️&nbsp; Standardiser les templates, surveiller RAM inutilisée</td>
            </tr>
            <tr>
              <td>1</td>
              <td>VM isolée &amp; extrême</td>
              <td>🔍&nbsp; Audit immédiat, risque de saturation / anomalie</td>
            </tr>
            <tr>
              <td>2</td>
              <td>VMs critiques</td>
              <td>💰&nbsp; Vérifier coût/besoin réel, protéger les performances</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClusterAnalysis;
