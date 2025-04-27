const fs = require("fs");
const path = require("path");

const saveVectorStore = (vectorStore, filename = "vectorStore.json") => {
  const filePath = path.join(__dirname, filename);
  fs.writeFileSync(filePath, JSON.stringify(vectorStore, null, 2), "utf-8");
  console.log("✅ Vector store saved to:", filePath);
};

module.exports = saveVectorStore;
