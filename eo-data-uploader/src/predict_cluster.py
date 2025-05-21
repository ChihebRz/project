import sys
import joblib
import json
import numpy as np
import pandas as pd

# 🔹 Charger le modèle KMeans et le scaler
try:
    model = joblib.load('./kmeans.pkl')
    scaler = joblib.load('./kmeans_scaler.pkl')
except Exception as e:
    print(f"Error loading model or scaler: {str(e)}")
    sys.exit(1)

# 🔹 Récupérer les arguments envoyés depuis le backend Node.js
try:
    cpu = float(sys.argv[1])
    memory = float(sys.argv[2])
    nics = float(sys.argv[3])
    disks = float(sys.argv[4])
    in_use_mib = float(sys.argv[5])
    sockets = float(sys.argv[6])
    cores_per_socket = float(sys.argv[7])
    capacity_mib = float(sys.argv[8])
    provisioned_mib = float(sys.argv[9])
except Exception as e:
    print(f"Error parsing input arguments: {str(e)}")
    sys.exit(1)

# 🔹 Calcul des variables dérivées
used_memory_ratio = in_use_mib / provisioned_mib if provisioned_mib != 0 else 0
cpu_per_socket = cpu / sockets if sockets != 0 else 0
disk_usage_ratio = capacity_mib / provisioned_mib if provisioned_mib != 0 else 0

# 🔹 Préparer le vecteur d’entrée avec des noms explicites (évite le warning)
feature_names = [
    'Memory', 'Provisioned_MiB', 'In_Use_MiB',
    'CPU_Count', 'CPU_Sockets', 'CPU_CoresPerSocket',
    'Capacity_MiB', 'Used_Memory_Ratio', 'CPU_per_Socket', 'Disk_Usage_Ratio'
]

input_df = pd.DataFrame([[
    memory, provisioned_mib, in_use_mib,
    cpu, sockets, cores_per_socket,
    capacity_mib, used_memory_ratio, cpu_per_socket, disk_usage_ratio
]], columns=feature_names)

# 🔹 Appliquer le scaler
try:
    scaled_input = scaler.transform(input_df)
except Exception as e:
    print(f"Scaling error: {str(e)}")
    sys.exit(1)

# 🔹 Prédire le cluster
try:
    cluster_label = int(model.predict(scaled_input)[0])
except Exception as e:
    print(f"Prediction error: {str(e)}")
    sys.exit(1)

# 🔹 Descriptions textuelles des clusters
cluster_descriptions = {
    0: "🟢 Cluster 0 ",
  
  1: "🔵 Cluster 1 ",
  
  2: "🟡 Cluster 2 "
}
# 🔹 Préparer la réponse JSON
response = {
    "clusterLabel": cluster_label,
    "message": cluster_descriptions.get(cluster_label, "Cluster non reconnu.")
}

# 🔹 Retour vers Node.js
print(json.dumps(response))
