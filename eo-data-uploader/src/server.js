import express from "express";
import cors from "cors";
import pg from "pg";
import { promises as fs } from "fs";
import path from "path";
import { parse } from "csv-parse";
import chardet from "chardet";
import { Ollama } from "ollama";
import { spawn } from "child_process";

const { Pool } = pg;
const app = express();
app.use(express.json());
app.use(cors());

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "eo_datacenter",
  password: "0",
  port: 5432,
});

const ollama = new Ollama({ host: "http://localhost:11434" });

const databaseSchema = `...`; // Keep your schema definition here (truncated for brevity)

// 🔁 Encoding helpers
function normalizeEncoding(encoding) {
  const encodingMap = {
    "ISO-8859-1": "latin1",
    "UTF-8": "utf8",
    "Windows-1252": "win1252",
  };
  return encodingMap[encoding] || "latin1";
}

async function detectDelimiter(filePath, encoding) {
  const content = await fs.readFile(filePath, encoding);
  const firstLine = content.toString().split("\n")[0];
  const delimiters = [",", ";", "\t", "|"];
  return delimiters.reduce((prev, curr) =>
    firstLine.split(curr).length > firstLine.split(prev).length ? curr : prev
  );
}

// 📁 Directory Upload Logic
async function checkFolderUploaded(folderDate, tables) {
  const client = await pool.connect();
  try {
    for (const table of tables) {
      const result = await client.query(
        `SELECT EXISTS (SELECT 1 FROM public."${table}" WHERE "Date" = $1)`,
        [folderDate]
      );
      if (result.rows[0].exists) return true;
    }
    return false;
  } finally {
    client.release();
  }
}

async function processAndUploadCsv(filePath, tableName, dateStr) {
  const formattedDateStr = `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
  const dateObj = new Date(formattedDateStr);
  if (isNaN(dateObj.getTime())) throw new Error(`Invalid date format: ${formattedDateStr}`);

  const year = dateObj.getFullYear();
  const quarter = Math.floor((dateObj.getMonth() + 3) / 3);
  const month = dateObj.getMonth() + 1;
  const day = dateObj.getDate();

  const rawEncoding = chardet.detectFileSync(filePath) || "ISO-8859-1";
  const encoding = normalizeEncoding(rawEncoding);
  const content = await fs.readFile(filePath, encoding);
  const delimiter = await detectDelimiter(filePath, encoding);

  const csvData = [];
  const parser = parse(content, { columns: true, skip_empty_lines: true, delimiter, relax_column_count: true });
  for await (const row of parser) {
    row.Date = dateObj.toISOString().split("T")[0];
    row.Year = year;
    row.Quarter = quarter;
    row.Month = month;
    row.Day = day;
    csvData.push(row);
  }

  const client = await pool.connect();
  try {
    for (const row of csvData) {
      const columns = Object.keys(row).map(col => `"${col.replace(/ /g, "_")}"`).join(",");
      const values = Object.values(row);
      const placeholders = values.map((_, i) => `$${i + 1}`).join(",");
      await client.query(`INSERT INTO public."${tableName}" (${columns}) VALUES (${placeholders})`, values);
    }
    return `${path.basename(filePath)} uploaded successfully to ${tableName}`;
  } finally {
    client.release();
  }
}

app.post("/upload-directory", async (req, res) => {
  const { directory } = req.body;
  const uploadedFiles = [];
  try {
    const folders = (await fs.readdir(directory, { withFileTypes: true }))
      .filter(dirent => dirent.isDirectory() && /^\d{8}$/.test(dirent.name))
      .map(dirent => dirent.name)
      .sort();

    const tables = ["cpu", "disk", "info"];
    for (const folder of folders) {
      if (await checkFolderUploaded(folder, tables)) continue;
      const folderPath = path.join(directory, folder);
      const files = (await fs.readdir(folderPath)).filter(f => f.endsWith(".csv"));
      for (const file of files) {
        const filePath = path.join(folderPath, file);
        let tableName;
        if (file.includes("vCPU")) tableName = "cpu";
        else if (file.includes("vDisk")) tableName = "disk";
        else if (file.includes("vInfo")) tableName = "info";
        else continue;

        const result = await processAndUploadCsv(filePath, tableName, folder);
        uploadedFiles.push(`${folder}/${file}`);
        console.log(result);
      }
    }
    res.json({ uploadedFiles });
  } catch (error) {
    console.error(`Upload error: ${error.message}`);
    res.status(500).json({ error: "Upload failed", details: error.message });
  }
});

// 📦 Predict VM cluster from model
app.post("/predict", (req, res) => {
  const {
    cpu, memory, nics, disks,
    in_use_mib, sockets, cores_per_socket,
    capacity_mib, provisioned_mib
  } = req.body;

  if ([cpu, memory, nics, disks, in_use_mib, sockets, cores_per_socket, capacity_mib, provisioned_mib]
    .some(v => v === undefined || v === null || isNaN(v))) {
    return res.status(400).json({ error: "Missing or invalid input data" });
  }

  const inputVector = [
    cpu, memory, nics, disks,
    in_use_mib, sockets, cores_per_socket,
    capacity_mib, provisioned_mib
  ];

  console.log('📦 Sending features to Python:', inputVector);
  const pythonProcess = spawn('python', ['predict_cluster.py', ...inputVector.map(String)]);
  let result = '';

  pythonProcess.stdout.on('data', data => result += data.toString());
  pythonProcess.stderr.on('data', data => console.error(`stderr: ${data}`));

  pythonProcess.on('close', code => {
    if (code === 0) {
      try {
        const prediction = JSON.parse(result);
        res.json(prediction);
      } catch (err) {
        res.status(500).send("Invalid output from Python script");
      }
    } else {
      res.status(500).send("Error in Python script");
    }
  });
});

// 📡 Get VM list
app.get("/vms", async (req, res) => {
  try {
    const result = await pool.query(`SELECT DISTINCT "VM" FROM public.info ORDER BY "VM"`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).send("Error fetching VMs");
  }
});

// 📡 Get latest VM data
app.get("/vm/:vmName", async (req, res) => {
  const vmName = req.params.vmName;
  try {
    const query = `
      SELECT i."VM_UUID", i."CPUs", i."Memory", i."Provisioned_MiB", i."In_Use_MiB", i."NICs", 
             c."Sockets", c."Cores_p/s" AS "Cores_p_s", d."Capacity_MiB"
      FROM public.info i
      LEFT JOIN public.cpu c ON i."VM_UUID" = c."VM_UUID"
      LEFT JOIN public.disk d ON i."VM_UUID" = d."VM_UUID"
      WHERE i."VM" = $1
      ORDER BY i."Date" DESC
      LIMIT 1;
    `;
    const result = await pool.query(query, [vmName]);
    if (result.rows.length === 0) return res.status(404).send("VM not found");

    const row = result.rows[0];
    res.json({
      CPUs: row.CPUs,
      Memory: row.Memory,
      NICs: row.NICs,
      Disks: 1,
      In_Use_MiB: row.In_Use_MiB,
      Sockets: row.Sockets,
      Cores_p_s: row.Cores_p_s,
      Capacity_MiB: row.Capacity_MiB,
      Provisioned_MiB: row.Provisioned_MiB
    });
  } catch (err) {
    res.status(500).send("Error fetching VM data");
  }
});

// 🤖 Chatbot
app.post("/chat", async (req, res) => {
  const { message } = req.body;
  try {
    const sqlPrompt = `...`; // Keep your prompt from the previous script
    const sqlResponse = await ollama.generate({
      model: "mistral",
      prompt: sqlPrompt.replace("MESSAGE", message),
      max_tokens: 150,
    });

    let sqlQuery = sqlResponse.response.trim();
    if (!sqlQuery.toLowerCase().startsWith("select")) {
      sqlQuery = `SELECT COUNT(DISTINCT "Date") as data_days FROM public."info"`;
    }

    const client = await pool.connect();
    let dbResult;
    try {
      dbResult = await client.query(sqlQuery);
    } catch (err) {
      dbResult = { rows: [], error: err.message };
    } finally {
      client.release();
    }

    const answerPrompt = `...`; // Also reuse your answerPrompt here

    const answerResponse = await ollama.generate({
      model: "mistral",
      prompt: answerPrompt
        .replace("MESSAGE", message)
        .replace("RESULT", JSON.stringify(dbResult.rows))
        .replace("ERROR", dbResult.error || ""),
      max_tokens: 200,
    });

    const reply = answerResponse.response.trim();
    res.json({ reply });
  } catch (error) {
    res.status(500).json({ reply: "Oops, something went wrong." });
  }
});

// 🚀 Launch server
app.listen(5000, () => console.log("✅ Server running on http://localhost:5000"));
