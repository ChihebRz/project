const { execSync } = require("child_process");

function getEmbedding(text) {
    const result = execSync(`python embedding.py "${text}"`);
  return JSON.parse(result.toString());
}

module.exports = getEmbedding;
