const Memory = require('../models/Memory');
const { checkSimilarity, generateFingerprint } = require('../utils/textSimilarity');
const logger = require('../utils/logger');

/**
 * Check if a topic has already been covered
 * @param {string} topicText - Topic title + description
 * @returns {Promise<{isDuplicate: boolean, similarity: number}>}
 */
const checkDuplicate = async (topicText) => {
  const fingerprint = generateFingerprint(topicText);
  const existing = await Memory.findOne({ topicFingerprint: fingerprint });

  if (existing) {
    return { isDuplicate: true, similarity: 1.0 };
  }

  // Check keyword similarity
  const allMemories = await Memory.find().select('summary').limit(100);
  const summaries = allMemories.map((m) => m.summary).filter(Boolean);

  if (summaries.length === 0) {
    return { isDuplicate: false, similarity: 0 };
  }

  const result = checkSimilarity(topicText, summaries, 0.65);
  return result;
};

/**
 * Get recent memories for context injection
 * @param {number} limit - Number of memories to retrieve
 * @returns {Promise<string[]>} Array of summary strings
 */
const getRecentContext = async (limit = 10) => {
  const memories = await Memory.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('summary keywords');

  return memories.map((m) => `${m.summary} [${m.keywords.join(', ')}]`);
};

/**
 * Get memory stats
 */
const getMemoryStats = async () => {
  const total = await Memory.countDocuments();
  const recent = await Memory.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select('summary createdAt');

  return { totalMemories: total, recent };
};

module.exports = { checkDuplicate, getRecentContext, getMemoryStats };
