import express from "express";
import cors from "cors";
import pg from "pg";
import { promises as fs } from "fs";
import path from "path";
import { parse } from "csv-parse";
import chardet from "chardet";
import { Ollama } from "ollama";

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

// Schéma générique basé sur tes uploads (à ajuster après ta réponse)
const databaseSchema = `
Tables disponibles dans la base de données "eo_datacenter":
1. public."cpu"
   - Columns: "Date" (DATE), "CPU_Usage" (NUMERIC, assumed), "Year" (INTEGER), "Quarter" (INTEGER), "Month" (INTEGER), "Day" (INTEGER)
2. public."disk"
   - Columns: "Date" (DATE), "Disk_Usage" (NUMERIC, in GB, assumed), "Year" (INTEGER), "Quarter" (INTEGER), "Month" (INTEGER), "Day" (INTEGER)
3. public."info"
   - Columns: "Date" (DATE), "Status" (TEXT, assumed), "Year" (INTEGER), "Quarter" (INTEGER), "Month" (INTEGER), "Day" (INTEGER)
Note: Les dates sont au format 'YYYY-MM-DD'. Les noms de colonnes et tables sont sensibles à la casse et doivent être entourés de guillemets doubles (ex. "CPU_Usage", public."cpu"). Si une colonne supposée (comme "CPU_Usage") n’existe pas, utilise les colonnes disponibles ou raisonne autrement.
`;

// Fonctions existantes (upload) inchangées
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
      const folderDate = folder;
      if (await checkFolderUploaded(folderDate, tables)) continue;

      const folderPath = path.join(directory, folder);
      const files = (await fs.readdir(folderPath)).filter(f => f.endsWith(".csv"));
      for (const file of files) {
        const filePath = path.join(folderPath, file);
        let tableName;
        if (file.includes("vCPU")) tableName = "cpu";
        else if (file.includes("vDisk")) tableName = "disk";
        else if (file.includes("vInfo")) tableName = "info";
        else continue;

        const result = await processAndUploadCsv(filePath, tableName, folderDate);
        uploadedFiles.push(`${folder}/${file}`);
        console.log(result);
      }
    }
    res.json({ uploadedFiles });
  } catch (error) {
    console.error(`Error in upload-directory: ${error.message}`);
    res.status(500).json({ error: "Upload failed", details: error.message });
  }
});

// Route avancée pour le chatbot
app.post("/chat", async (req, res) => {
  const { message } = req.body;
  console.log(`Chatbot received: "${message}"`);
  try {
    // Étape 1 : Générer une requête SQL avec Mistral
    const sqlPrompt = `
      You are an advanced AI assistant like Grok, with access to a PostgreSQL database. Based on this schema:
      ${databaseSchema}
      Generate a valid PostgreSQL query to answer the user's question: "${message}". 
      - Use correct syntax: double quotes for table/column names (e.g., public."cpu"."CPU_Usage").
      - Handle typos gracefully (e.g., "virtulas" → "virtual", "coloum" → "column").
      - If the question implies counting VMs but there's no "Server_Name", use DISTINCT "Date" or another creative approach.
      - Return only the SQL query as plain text.
      Examples:
      - "how many virtual machines" → SELECT COUNT(DISTINCT "Date") as vm_days FROM public."info"
      - "cpu usage last week" → SELECT "Date", AVG("CPU_Usage") FROM public."cpu" WHERE "Date" >= CURRENT_DATE - INTERVAL '7 days' GROUP BY "Date"
      - "highest disk usage" → SELECT "Date", MAX("Disk_Usage") FROM public."disk" GROUP BY "Date" ORDER BY MAX("Disk_Usage") DESC LIMIT 1
    `;
    const sqlResponse = await ollama.generate({
      model: "mistral",
      prompt: sqlPrompt,
      max_tokens: 150,
    });
    let sqlQuery = sqlResponse.response.trim();
    console.log(`Generated SQL query: "${sqlQuery}"`);

    // Étape 2 : Valider la requête
    if (!sqlQuery.toLowerCase().startsWith("select")) {
      sqlQuery = `SELECT COUNT(DISTINCT "Date") as data_days FROM public."info"`;
      console.log(`Invalid query detected, using fallback: "${sqlQuery}"`);
    }

    // Étape 3 : Exécuter la requête SQL
    let dbResult;
    const client = await pool.connect();
    try {
      dbResult = await client.query(sqlQuery);
      console.log(`Database result: ${JSON.stringify(dbResult.rows)}`);
    } catch (dbError) {
      console.error(`SQL execution error: ${dbError.message}`);
      dbResult = { rows: [], error: dbError.message };
    } finally {
      client.release();
    }

    // Étape 4 : Générer une réponse naturelle
    const answerPrompt = `
      You are an advanced AI assistant like Grok. The user asked: "${message}"
      Database schema: ${databaseSchema}
      Query result: ${JSON.stringify(dbResult.rows)}
      ${dbResult.error ? `Query error: ${dbResult.error}` : ""}
      Provide a concise, conversational answer based on the data.
      - If there's data, summarize it naturally (e.g., "There’s data for 15 distinct days, which might indicate the number of VMs.").
      - If there's an error, explain simply and suggest a fix (e.g., "I couldn’t find that column. What do you mean by X?").
      - Handle typos or vague questions intelligently (e.g., "virtulas" → "virtual machines").
    `;
    const answerResponse = await ollama.generate({
      model: "mistral",
      prompt: answerPrompt,
      max_tokens: 200,
    });
    const reply = answerResponse.response.trim();
    console.log(`Mistral response: "${reply}"`);

    res.json({ reply });
  } catch (error) {
    console.error(`Chatbot error: ${error.message}`);
    res.status(500).json({ reply: "Oops, something went wrong. Try rephrasing your question!" });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));