const express = require("express");
const router = express.Router();
const { spawn } = require("child_process");
const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

// PostgreSQL connection
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "eo_datacenter",
  password: "0",
  port: 5432,
});

// === GET /api/forecast?vm=VM_NAME (Single VM forecast)
router.get("/", (req, res) => {
  const vm = req.query.vm;
  if (!vm) return res.status(400).json({ error: "Missing VM name" });

  const py = spawn("python", ["forecast_runner.py", vm]);

  let result = "";
  py.stdout.on("data", (data) => (result += data.toString()));
  py.stderr.on("data", (data) => console.error(`stderr: ${data}`));

  py.on("close", (code) => {
    try {
      const parsed = JSON.parse(result);
      res.json(parsed);
    } catch (err) {
      res.status(500).json({
        error: "Error parsing forecast result",
        details: result,
      });
    }
  });
});

// === GET /api/forecast/vms (VM list from PostgreSQL)
router.get("/vms", async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT DISTINCT "VM" FROM info WHERE "VM" IS NOT NULL ORDER BY "VM" ASC'
    );
    const vmList = result.rows.map((row) => row.VM);
    res.json(vmList);
  } catch (err) {
    console.error("❌ Error fetching VMs:", err);
    res.status(500).json({ error: "Failed to fetch VM names from database" });
  }
});

// === GET /api/forecast/all (Run bulk forecast + return JSON)
router.get("/all", (req, res) => {
  const py = spawn("python", ["forecast_runner.py", "--all"]);

  let stderr = "";
  py.stderr.on("data", (data) => (stderr += data.toString()));

  py.on("close", (code) => {
    if (code !== 0) {
      return res.status(500).json({
        error: "Forecast script failed",
        details: stderr,
      });
    }

    const resultPath = path.join(__dirname, "..", "forecast_results.json");
    try {
      const raw = fs.readFileSync(resultPath, "utf-8");
      const parsed = JSON.parse(raw);
      res.json(parsed);
    } catch (err) {
      res.status(500).json({
        error: "Failed to load forecast results file",
        details: err.message,
      });
    }
  });
});

module.exports = router;
