function chunkText(text, chunkSize = 500) {
    const sentences = text.split(/(?<=[.?!])\s+/);
    let chunks = [];
    let current = "";
  
    for (let sentence of sentences) {
      if ((current + sentence).length > chunkSize) {
        chunks.push(current.trim());
        current = "";
      }
      current += sentence + " ";
    }
  
    if (current.trim()) chunks.push(current.trim());
    return chunks;
  }
  
  module.exports = chunkText;
  