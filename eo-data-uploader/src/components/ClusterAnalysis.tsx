// src/components/ClusterAnalysis.js
import React from 'react';
import './ClusterAnalysis.css';

const clusters = [
  {
    id: 0,
    title: "VMs de Production Standard",
    subtitle: "VMs équilibrées, très répandues ",
    specs: {
      RAM: "~16 Go",
      CPU: "~5 (2-4 cœurs)",
      Disk: "~275 Go",
      RAMUsage: "~46%",
      DiskUsage: "~81%"
    },
    usage: [
      "Serveurs web (Apache, NGINX, Tomcat)",
      "Petites applications métiers",
      "Services internes (authentification, monitoring)",
      "Environnements de tests légers"
    ],
    recommendations: [
      "Bonne efficacité : ratio mémoire/disque bien équilibré.",
      "Optimisation possible : vérifier les VMs <50% RAM utilisée → possibilité de réduire la RAM.",
      "Automation recommandée : ce groupe étant majoritaire, idéal pour standardiser les templates de déploiement."
    ]
  },
  {
    id: 1,
    title: "VM Très Haute Capacité ou Anomalie",
    subtitle: "VM très rare mais surprovisionnée",
    specs: {
      RAM: "12 Go",
      CPU: "4",
      Disk: "~39 To",
      DiskUsed: "~35 To",
      DiskUsage: "44%"
    },
    usage: [
      "Serveur NAS/SAN virtualisé (stockage réseau)",
      "VM utilisée pour sauvegardes centralisées",
      "Service d'archivage massif",
      "OU erreur de configuration"
    ],
    recommendations: [
      "Audit immédiat : valider l’usage réel de cette VM.",
      "Risque de SPOF : trop de données critiques sur une seule VM.",
      "Surcoût potentiel : surveiller coûts de stockage (RAID, backup, snapshot).",
      "Migrer cette charge vers solution dédiée si besoin (ex : stockage objet)."
    ]
  },
  {
    id: 2,
    title: "VMs Surprovisionnées / Très Performantes",
    subtitle: "VMs critiques ou intensives ",
    specs: {
      RAM: "~138 Go",
      CPU: "~32",
      Disk: "~2.1 To",
      RAMUsage: "58%",
      DiskUsage: "~81%"
    },
    usage: [
      "Serveurs de base de données haute dispo (PostgreSQL, Oracle RAC)",
      "Services analytiques (Hadoop, Spark)",
      "Modèles IA / Deep Learning",
      "Traitement vidéo, Big Data, simulations scientifiques"
    ],
    recommendations: [
      "Surveiller les performances : CPU/RAM.",
      "Réserver ces VMs à des usages critiques uniquement.",
      "Coût élevé → limiter leur prolifération.",
      "Réduction possible si RAM > 120 Go mais faible usage."
    ]
  }
];

const ClusterAnalysis = () => {
  return (
    <div className="cluster-analysis">
      <h2>Analyse des Clusters du Datacenter</h2>
      <p>Vue détaillée des clusters, cas d’usage concrets et recommandations stratégiques.</p>

      {clusters.map(cluster => (
        <div className="cluster-card" key={cluster.id}>
          <h3>Cluster {cluster.id} – {cluster.title}</h3>
          <p><strong>{cluster.subtitle}</strong></p>

          <div className="grid">
            <div className="box specs">
              <h4>Spécifications</h4>
              <ul>
                {Object.entries(cluster.specs).map(([key, value], idx) => (
                  <li key={idx}><strong>{key}:</strong> {value}</li>
                ))}
              </ul>
            </div>

            <div className="box usage">
              <h4>Cas d’usage typiques</h4>
              <ul>{cluster.usage.map((item, i) => <li key={i}>{item}</li>)}</ul>
            </div>

            <div className="box recommendations">
              <h4>Recommandations</h4>
              <ul>{cluster.recommendations.map((item, i) => <li key={i}>{item}</li>)}</ul>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ClusterAnalysis;
