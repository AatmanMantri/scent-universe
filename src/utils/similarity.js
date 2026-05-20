export function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Calculate similarity based on shared notes (Jaccard-like approach for text features)
export function calculateNoteSimilarity(perfumeA, perfumeB) {
  const getNotes = (p) => [...p.topNotes, ...p.middleNotes, ...p.baseNotes].map(n => n.toLowerCase());
  
  const notesA = new Set(getNotes(perfumeA));
  const notesB = new Set(getNotes(perfumeB));
  
  let intersection = 0;
  notesA.forEach(note => {
    if (notesB.has(note)) intersection++;
  });
  
  const union = new Set([...notesA, ...notesB]).size;
  return (intersection / union) * 100; // Return as percentage
}

// Calculate distance based on pre-computed 3D coordinates
export function calculateSpatialDistance(coordA, coordB) {
  const dx = coordA[0] - coordB[0];
  const dy = coordA[1] - coordB[1];
  const dz = coordA[2] - coordB[2];
  return Math.sqrt(dx*dx + dy*dy + dz*dz);
}

// Find top N most similar perfumes based on spatial distance
export function findSimilarPerfumes(targetPerfume, allPerfumes, limit = 3) {
  const others = allPerfumes.filter(p => p.id !== targetPerfume.id);
  
  const withDistances = others.map(p => {
    const dist = calculateSpatialDistance(targetPerfume.coordinates, p.coordinates);
    // Convert distance to a similarity score (closer = higher score, max 100%)
    // Assuming max realistic distance in our mock space is around 4.0
    const score = Math.max(0, 100 - (dist / 4.0) * 100);
    
    return {
      ...p,
      distance: dist,
      similarityScore: score
    };
  });
  
  return withDistances.sort((a, b) => a.distance - b.distance).slice(0, limit);
}
