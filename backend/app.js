const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const { Pool } = require("pg");

const extractTextFromPDF = require("./pdfProcessor");
const chunkText = require("./chunker");
const getEmbedding = require("./generateEmbedding"); // This is likely async
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
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "eo_datacenter",
  password: "0",
  port: 5432,
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

pool.connect()
  .then(() => console.log("✅ Connected to PostgreSQL pool"))
  .catch(console.error);

// Hardcoded question-to-SQL map for complex queries
const predefinedQueries = [
  {
    keywords: ["highest memory", "max memory", "maximum memory", "top memory"],
    sql: `SELECT "VM", "Memory" FROM "info" ORDER BY "Memory" DESC LIMIT 1;`,
  },
  {
    keywords: ["count powered on", "number powered on", "how many poweredOn"],
    sql: `SELECT COUNT(DISTINCT "VM") AS powered_on_count FROM "info" WHERE "Powerstate" = 'poweredOn';`,
  },
  {
    keywords: ["average cpu", "mean cpu", "average CPUs"],
    sql: `SELECT AVG("CPUs") AS avg_cpus FROM "info";`,
  },
  {
    keywords: ["top 5 vms with most disks", "vms with most disks", "top 5 vms disks"],
    sql: `SELECT DISTINCT "VM"", "Disks" FROM "info" ORDER BY "Disks" DESC LIMIT 5;`,
  },
  {
    keywords: ["count vms by powerstate", "number of vms by powerstate", "group by powerstate"],
    sql: `SELECT "Powerstate", COUNT(DISTINCT "VM") AS vm_count FROM "info" GROUP BY "Powerstate";`,
  },
  {
    keywords: ["vms with most nics", "top 5 vms with most network interfaces", "vms with highest nics"],
    sql: `SELECT "VM", "NICs" FROM "info" ORDER BY "NICs" DESC LIMIT 5;`,
  },
  {
    keywords: ["vms by datacenter", "count vms per datacenter", "vms distribution by datacenter"],
    sql: `SELECT "Datacenter", COUNT(DISTINCT "VM") AS vm_count FROM "info" GROUP BY "Datacenter" ORDER BY vm_count DESC;`,
  },
  {
    keywords: ["vms by cluster", "count vms per cluster", "vms distribution by cluster"],
    sql: `SELECT "Cluster", COUNT(DISTINCT "VM") AS vm_count FROM "info" GROUP BY "Cluster" ORDER BY vm_count DESC;`,
  },
  {
    keywords: ["vms with consolidation needed", "consolidation needed vms", "vms needing consolidation"],
    sql: `SELECT "VM", "Consolidation_Needed" FROM "info" WHERE "Consolidation_Needed" = 'true';`,
  },
  {
    keywords: ["vms by os", "count vms by operating system", "vms distribution by os"],
    sql: `SELECT "OS_according_to_the_VMware_Tools", COUNT(DISTINCT "VM") AS vm_count FROM "info" GROUP BY "OS_according_to_the_VMware_Tools" ORDER BY vm_count DESC;`,
  },
  {
    keywords: ["vms with ha enabled", "high availability vms", "ha protected vms"],
    sql: `SELECT "VM", "HA_Restart_Priority" FROM "info" WHERE "HA_Restart_Priority" IS NOT NULL;`,
  },
  {
    keywords: ["vms by resource pool", "count vms per resource pool", "vms distribution by resource pool"],
    sql: `SELECT "Resource_pool", COUNT(DISTINCT "VM") AS vm_count FROM "info" GROUP BY "Resource_pool" ORDER BY vm_count DESC;`,
  },
  {
    keywords: ["vms with ft enabled", "fault tolerance vms", "ft protected vms"],
    sql: `SELECT "VM", "FT_State" FROM "info" WHERE "FT_State" IS NOT NULL;`,
  },
  {
    keywords: ["vms by folder", "count vms per folder", "vms distribution by folder"],
    sql: `SELECT "Folder", COUNT(DISTINCT "VM") AS vm_count FROM "info" GROUP BY "Folder" ORDER BY vm_count DESC;`,
  },
  {
    keywords: ["vms with most provisioned storage", "top 5 vms by storage", "vms with highest provisioned storage"],
    sql: `SELECT "VM", "Provisioned_MiB" FROM "info" ORDER BY "Provisioned_MiB" DESC LIMIT 5;`,
  }
];

// ------------------ /upload Endpoint -------------------
app.post("/upload", upload.single("pdf"), async (req, res) => {
  try {
    console.log("🟡 Upload request received...");
    const filePath = req.file.path;
    const text = await extractTextFromPDF(filePath);

    const chunks = chunkText(text);

    // IMPORTANT: Await getEmbedding for each chunk (assuming async)
    vectorStore = [];
    for (const chunk of chunks) {
      const embedding = await getEmbedding(chunk);
      vectorStore.push({ chunk, embedding });
    }

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

    const lowerQuestion = question.toLowerCase();
    const matchedPredefined = predefinedQueries.find(({ keywords }) =>
      keywords.some(keyword => lowerQuestion.includes(keyword))
    );

    if (matchedPredefined) {
      console.log("💡 Matched predefined question, running fixed SQL.");
      const sqlQuery = matchedPredefined.sql;
      console.log("📄 Running predefined SQL:", sqlQuery);

      const queryResult = await pool.query(sqlQuery);
      console.log("✅ Predefined SQL executed successfully");

      const explanationMap = {
        "highest memory": "This query returns the VM with the highest memory allocation.",
        "count powered on": "This query returns the count of VMs currently powered on.",
        "average cpu": "This query calculates the average number of CPUs across all VMs.",
        "top 5 vms with most disks": "This query lists the top 5 VMs with the highest number of disks.",
        "count vms by powerstate": "This query shows the count of VMs grouped by their power state.",
      };

      let explanation = "Here is the result for your query.";
      for (const key in explanationMap) {
        if (lowerQuestion.includes(key)) {
          explanation = explanationMap[key];
          break;
        }
      }

      return res.json({
        answer: explanation,
        data: queryResult.rows,
      });
    }

    if (!vectorStore.length) {
      return res.status(400).json({ error: "Vector store not loaded. Upload a PDF first." });
    }

    // Await embedding generation for the question
    const queryEmbedding = await getEmbedding(question);

    const topChunks = retrieveTopKChunks(queryEmbedding, vectorStore);
    const context = topChunks.join("\n\n");

    const sqlPrompt = `
You are an AI assistant. Based on the context below, return ONLY a valid SQL query.
Use the table named "info". Wrap all column names in double quotes (e.g., "CPUs").
Do NOT return markdown formatting, explanations, or comments — just output raw SQL.

Given the following PostgreSQL table schema:
CREATE TABLE IF NOT EXISTS public.info
(
    id integer NOT NULL DEFAULT nextval('info_id_seq'::regclass),
    "VM" text COLLATE pg_catalog."default",
    "Powerstate" text COLLATE pg_catalog."default",
    "Template" text COLLATE pg_catalog."default",
    "SRM_Placeholder" text COLLATE pg_catalog."default",
    "Config_status" text COLLATE pg_catalog."default",
    "DNS_Name" text COLLATE pg_catalog."default",
    "Connection_state" text COLLATE pg_catalog."default",
    "Guest_state" text COLLATE pg_catalog."default",
    "Heartbeat" text COLLATE pg_catalog."default",
    "Consolidation_Needed" text COLLATE pg_catalog."default",
    "PowerOn" text COLLATE pg_catalog."default",
    "Suspend_time" text COLLATE pg_catalog."default",
    "Creation_date" text COLLATE pg_catalog."default",
    "Change_Version" text COLLATE pg_catalog."default",
    "CPUs" integer,
    "Memory" integer,
    "NICs" integer,
    "Disks" integer,
    "min_Required_EVC_Mode_Key" text COLLATE pg_catalog."default",
    "Latency_Sensitivity" text COLLATE pg_catalog."default",
    "EnableUUID" text COLLATE pg_catalog."default",
    "CBT" text COLLATE pg_catalog."default",
    "Primary_IP_Address" text COLLATE pg_catalog."default",
    "Network_#1" text COLLATE pg_catalog."default",
    "Network_#2" text COLLATE pg_catalog."default",
    "Network_#3" text COLLATE pg_catalog."default",
    "Network_#4" text COLLATE pg_catalog."default",
    "Network_#5" text COLLATE pg_catalog."default",
    "Network_#6" text COLLATE pg_catalog."default",
    "Network_#7" text COLLATE pg_catalog."default",
    "Network_#8" text COLLATE pg_catalog."default",
    "Num_Monitors" integer,
    "Video_Ram_KiB" integer,
    "Resource_pool" text COLLATE pg_catalog."default",
    "Folder" text COLLATE pg_catalog."default",
    "vApp" text COLLATE pg_catalog."default",
    "DAS_protection" text COLLATE pg_catalog."default",
    "FT_State" text COLLATE pg_catalog."default",
    "FT_Latency" text COLLATE pg_catalog."default",
    "FT_Bandwidth" text COLLATE pg_catalog."default",
    "FT_Sec._Latency" text COLLATE pg_catalog."default",
    "Provisioned_MiB" bigint,
    "In_Use_MiB" bigint,
    "Unshared_MiB" bigint,
    "HA_Restart_Priority" text COLLATE pg_catalog."default",
    "HA_Isolation_Response" text COLLATE pg_catalog."default",
    "HA_VM_Monitoring" text COLLATE pg_catalog."default",
    "Cluster_rule(s)" text COLLATE pg_catalog."default",
    "Cluster_rule_name(s)" text COLLATE pg_catalog."default",
    "Boot_Required" text COLLATE pg_catalog."default",
    "Boot_delay" integer,
    "Boot_retry_delay" integer,
    "Boot_retry_enabled" text COLLATE pg_catalog."default",
    "Boot_BIOS_setup" text COLLATE pg_catalog."default",
    "Firmware" text COLLATE pg_catalog."default",
    "HW_version" text COLLATE pg_catalog."default",
    "HW_upgrade_status" text COLLATE pg_catalog."default",
    "HW_upgrade_policy" text COLLATE pg_catalog."default",
    "HW_target" text COLLATE pg_catalog."default",
    "Path" text COLLATE pg_catalog."default",
    "Log_directory" text COLLATE pg_catalog."default",
    "Snapshot_directory" text COLLATE pg_catalog."default",
    "Suspend_directory" text COLLATE pg_catalog."default",
    "Annotation" text COLLATE pg_catalog."default",
    "Datacenter" text COLLATE pg_catalog."default",
    "Cluster" text COLLATE pg_catalog."default",
    "Host" text COLLATE pg_catalog."default",
    "OS_according_to_the_configuration_file" text COLLATE pg_catalog."default",
    "OS_according_to_the_VMware_Tools" text COLLATE pg_catalog."default",
    "VM_ID" text COLLATE pg_catalog."default",
    "VM_UUID" text COLLATE pg_catalog."default",
    "VI_SDK_Server_type" text COLLATE pg_catalog."default",
    "VI_SDK_API_Version" text COLLATE pg_catalog."default",
    "VI_SDK_Server" text COLLATE pg_catalog."default",
    "VI_SDK_UUID" text COLLATE pg_catalog."default",
    "Date" date,
    "Year" integer,
    "Quarter" integer,
    "Month" integer,
    "Day" integer,
    CONSTRAINT info_pkey PRIMARY KEY (id)
);

Strict rules:
- Use only valid PostgreSQL syntax.
- NEVER use GROUP BY unless the question explicitly asks to group by something.
- If the question asks for the "highest", "maximum", or "top" value (e.g., highest memory), use ORDER BY ... DESC LIMIT 1.
- If using COUNT, write it as COUNT(DISTINCT "column") to avoid duplicates.
- Do NOT invent column names. Use only the provided ones exactly as written.

Allowed Values:
- "Powerstate": "poweredOn", "poweredOff"
- "Connection state": "connected", "disconnected"
- "Guest state": "running", "notRunning"

🚫 Do not invent column names like "Power_State" or "VM_ID"
✅ Use "Powerstate" (not "Power_State")
✅ Use "VM" 

Context:
${context}

User Question:
${question}

SQL:
`;

    const sqlResponse = await axios.post("http://127.0.0.1:1234/v1/chat/completions", {
      model: "mistral",
      messages: [
        {
          role: "system",
          content: "You are a PostgreSQL SQL generator. Only output raw SQL queries with quoted column names using the table named 'info'. Do not include any explanations or markdown formatting."
        },
        { role: "user", content: sqlPrompt }
      ],
      temperature: 0,
      max_tokens: 500,
      stream: false
    }).catch(error => {
      if (error.response) {
        console.error("❌ LLM service error:", error.response.data);
        throw new Error(`LLM service error: ${error.response.data.error || error.response.statusText}`);
      } else if (error.request) {
        console.error("❌ LLM service not responding");
        throw new Error("LLM service is not running. Please make sure the LLM service is started at http://127.0.0.1:1234");
      } else {
        console.error("❌ Error setting up request:", error.message);
        throw new Error(`Error setting up request: ${error.message}`);
      }
    });

    let sqlQuery = sqlResponse.data.choices[0].message.content.trim();
    sqlQuery = sqlQuery.replace(/```sql|```/gi, "").trim();
    console.log("📄 SQL generated:", sqlQuery);

    const queryResult = await pool.query(sqlQuery);
    console.log("✅ SQL executed successfully");

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
      model: "mistral",
      messages: [
        {
          role: "system",
          content: "You are an expert AI that explains SQL results in natural language. Be concise and clear."
        },
        { role: "user", content: explanationPrompt }
      ],
      temperature: 0.5,
      max_tokens: 500,
      stream: false
    }).catch(error => {
      if (error.response) {
        console.error("❌ LLM service error:", error.response.data);
        throw new Error(`LLM service error: ${error.response.data.error || error.response.statusText}`);
      } else if (error.request) {
        console.error("❌ LLM service not responding");
        throw new Error("LLM service is not running. Please make sure the LLM service is started at http://127.0.0.1:1234");
      } else {
        console.error("❌ Error setting up request:", error.message);
        throw new Error(`Error setting up request: ${error.message}`);
      }
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

// Dashboard stats endpoint
app.get('/api/dashboard-stats', async (req, res) => {
  let client;
  try {
    client = await pool.connect();
    const totalResult = await client.query('SELECT COUNT(distinct "VM") FROM public.info');
    const avgMemoryResult = await client.query('SELECT AVG("Memory") FROM public.info');
    const avgCPUResult = await client.query('SELECT AVG("CPUs") FROM public.info');
    const storageUsedResult = await client.query('SELECT SUM("In_Use_MiB") FROM public.info');
    
    console.log({
      totalResult: totalResult.rows,
      avgMemoryResult: avgMemoryResult.rows,
      avgCPUResult: avgCPUResult.rows,
      storageUsedResult: storageUsedResult.rows,
    });

    res.json({
      total: Number(totalResult.rows[0].count),
      avgMemory: Math.round(Number(avgMemoryResult.rows[0].avg) || 0),
      avgCPU: Number(avgCPUResult.rows[0].avg) || 0,
      storageUsed: Math.round(Number(storageUsedResult.rows[0].sum) || 0),
    });
  } catch (err) {
    console.error('❌ Failed to fetch dashboard stats:', err.message);
    res.status(500).json({ error: 'Failed to fetch dashboard stats', details: err.message });
  } finally {
    if (client) {
      client.release();
    }
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
