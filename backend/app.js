const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const { Client } = require("pg");

const extractTextFromPDF = require("./pdfProcessor");
const chunkText = require("./chunker");
const getEmbedding = require("./generateEmbedding");
const retrieveTopKChunks = require("./ragEngine");
const saveVectorStore = require("./saveVectorStore");
const loadVectorStore = require("./loadVectorStore");

const app = express();
const PORT = 5001;

app.use(cors());
app.use(bodyParser.json());

const upload = multer({ dest: path.join(__dirname, "../uploads") });
let vectorStore = [];

// PostgreSQL configuration
const db = new Client({
  user: "postgres",
  host: "localhost",
  database: "eo_datacenter",
  password: "0",
  port: 5432,
});

db.connect()
  .then(() => console.log("✅ Connected to PostgreSQL"))
  .catch(console.error);

// ------------------ /upload Endpoint -------------------
app.post("/upload", upload.single("pdf"), async (req, res) => {
  try {
    console.log("🟡 Upload request received...");
    const filePath = req.file.path;
    const text = await extractTextFromPDF(filePath);
    const chunks = chunkText(text);
    vectorStore = chunks.map(chunk => ({
      chunk,
      embedding: getEmbedding(chunk),
    }));
    saveVectorStore(vectorStore);
    console.log("✅ PDF processed and vectorized.");
    res.send({ status: "success", chunks: chunks.length });
  } catch (err) {
    console.error("❌ Upload error:", err);
    res.status(500).send("Error processing PDF: " + err.message);
  }
});

// ------------------ /ask Endpoint -------------------
app.post("/ask", async (req, res) => {
  try {
    const { question } = req.body;
    console.log(`🔍 Received question: ${question}`);

    if (!vectorStore.length) {
      return res.status(400).json({ error: "Vector store not loaded. Upload a PDF first." });
    }

    const queryEmbedding = getEmbedding(question);
    const topChunks = retrieveTopKChunks(queryEmbedding, vectorStore);
    const context = topChunks.join("\n\n");

    // Step 1: Generate SQL Query
    const sqlPrompt = `
You are an AI assistant. Based on the context below, return ONLY a valid SQL query.
Wrap all column names in double quotes (e.g., "CPUs").
Do not use markdown or explanation. Return ONLY the raw SQL.
Note: Always use the table named "info".If using COUNT, always write it as COUNT(DISTINCT "column") to avoid duplicates.
Available Columns:
"VM", "Powerstate", "Template", "SRM_Placeholder", "Config_status", "DNS_Name", "Connection_state", "Guest_state", "Heartbeat", 
"Consolidation_Needed", "PowerOn", "Suspend_time", "Creation_date", "Change_Version", "CPUs", "Memory", "NICs", "Disks",
"min_Required_EVC_Mode_Key", "Latency_Sensitivity", "EnableUUID", "CBT", "Primary_IP_Address", "Network_#1", "Network_#2",
"Network_#3", "Network_#4", "Network_#5", "Network_#6", "Network_#7", "Network_#8", "Num_Monitors", "Video_Ram_KiB",
"Resource_pool", "Folder", "vApp", "DAS_protection", "FT_State", "FT_Latency", "FT_Bandwidth", "FT_Sec._Latency",
"Provisioned_MiB", "In_Use_MiB", "Unshared_MiB", "HA_Restart_Priority", "HA_Isolation_Response", "HA_VM_Monitoring",
"Cluster_rule(s)", "Cluster_rule_name(s)", "Boot_Required", "Boot_delay", "Boot_retry_delay", "Boot_retry_enabled",
"Boot_BIOS_setup", "Firmware", "HW_version", "HW_upgrade_status", "HW_upgrade_policy", "HW_target", "Path",
"Log_directory", "Snapshot_directory", "Suspend_directory", "Annotation", "Datacenter", "Cluster", "Host",
"OS_according_to_the_configuration_file", "OS_according_to_the_VMware_Tools", "VM_ID", "VM_UUID", "VI_SDK_Server_type",
"VI_SDK_API_Version", "VI_SDK_Server", "VI_SDK_UUID", "Date", "Year", "Quarter", "Month", "Day"

Allowed Values:
- "Powerstate": "poweredOn", "poweredOff"
- "Connection state": "connected", "disconnected"
- "Guest state": "running", "notRunning"

🚫 Do not invent column names like "Power_State" or "VM_ID"
✅ Use "Powerstate" (not "Power_State")
✅ Use "VM" or "VM_UUID" (if it exists)


Context:
${context}

User Question:
${question}

SQL:
`;

    const sqlResponse = await axios.post("http://127.0.0.1:1234/v1/chat/completions", {
      model: "mistral-7b-v0.1",
      messages: [
        {
          role: "system",
          content: "You are a PostgreSQL SQL generator. Only output raw SQL queries with quoted column names using the table named 'info'.",
        },
        { role: "user", content: sqlPrompt },
      ],
      temperature: 0,
    });

    let sqlQuery = sqlResponse.data.choices[0].message.content.trim();
    sqlQuery = sqlQuery.replace(/```sql|```/gi, "").trim();
    console.log("📄 SQL generated:", sqlQuery);

    // Step 2: Execute SQL
    const queryResult = await db.query(sqlQuery);
    console.log("✅ SQL executed successfully");

    // Step 3: Ask LLM to explain the result
    const explanationPrompt = `
You are a helpful AI assistant.
You are given a user's question and a result from a SQL query.
Provide a natural language answer to explain the result clearly and concisely.

User Question:
${question}

SQL Result:
${JSON.stringify(queryResult.rows, null, 2)}

Answer:
`;

    const explanationResponse = await axios.post("http://127.0.0.1:1234/v1/chat/completions", {
      model: "mistral-7b-v0.1",
      messages: [
        { role: "system", content: "You are an expert AI that explains SQL results in natural language." },
        { role: "user", content: explanationPrompt },
      ],
      temperature: 0.5,
    });

    const finalAnswer = explanationResponse.data.choices[0].message.content.trim();

    res.json({ answer: finalAnswer });

  } catch (err) {
    console.error("❌ Error:", err.message);
    res.status(500).json({ error: "Failed to generate or execute SQL", details: err.message });
  }
});

// ------------------ Load Existing Vector Store -------------------
if (fs.existsSync("vectorStore.json")) {
  vectorStore = loadVectorStore();
  console.log("📂 Vector store loaded from vectorStore.json");
}

app.listen(PORT, () => console.log(`✅ Backend running at http://localhost:${PORT}`));
