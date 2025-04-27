const cosineSimilarity = (a, b) => {
    const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
    const normA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
    const normB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
    return dot / (normA * normB);
  };
  
  function retrieveTopKChunks(queryEmbedding, vectorStore, topK = 3) {
    return vectorStore
      .map(({ chunk, embedding }) => ({
        chunk,
        score: cosineSimilarity(queryEmbedding, embedding),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map(item => item.chunk);
  }
  
  module.exports = retrieveTopKChunks;
  