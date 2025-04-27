const fs = require("fs");
const path = require("path");

const loadVectorStore = (filename = "vectorStore.json") => {
  const filePath = path.join(__dirname, filename);
  if (!fs.existsSync(filePath)) {
    console.warn("⚠️ Vector store file does not exist:", filePath);
    return [];
  }
  const data = fs.readFileSync(filePath, "utf-8");
  console.log("✅ Loaded vector store from:", filePath);
  return JSON.parse(data);
};

module.exports = loadVectorStore;
