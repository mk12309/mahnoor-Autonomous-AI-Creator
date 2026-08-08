const stringSimilarity = require('string-similarity');

/**
 * Check if a text is similar to any in a list of existing texts
 * @param {string} text - Text to check
 * @param {string[]} existingTexts - Array of existing texts to compare against
 * @param {number} threshold - Similarity threshold (0-1), default 0.6
 * @returns {{ isDuplicate: boolean, bestMatch: string|null, similarity: number }}
 */
const checkSimilarity = (text, existingTexts, threshold = 0.6) => {
  if (!existingTexts || existingTexts.length === 0) {
    return { isDuplicate: false, bestMatch: null, similarity: 0 };
  }

  const result = stringSimilarity.findBestMatch(text, existingTexts);
  const best = result.bestMatch;

  return {
    isDuplicate: best.rating >= threshold,
    bestMatch: best.target,
    similarity: Math.round(best.rating * 100) / 100,
  };
};

/**
 * Generate a simple fingerprint from text for quick dedup checks
 * @param {string} text - Input text
 * @returns {string} Normalized fingerprint
 */
const generateFingerprint = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .sort()
    .join(' ');
};

module.exports = { checkSimilarity, generateFingerprint };
