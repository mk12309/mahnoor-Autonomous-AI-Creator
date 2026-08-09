/**
 * Editorial Decision Service
 * 
 * Responsibility:
 * Evaluates discovered topics based on editorial metrics:
 * 1. Scores each discovered topic (0-100).
 * 2. Rejects low-scoring topics below relevance threshold.
 * 3. Selects EXACTLY ONE top-scoring topic for publishing per pipeline run.
 * 
 * Note: Uses heuristic rule scoring as interface placeholder (no AI provider integrated yet).
 */

const Topic = require('../models/Topic');
const config = require('../config/env');
const logger = require('../utils/logger');

/**
 * Score a single topic document (Placeholder logic using heuristic rule scoring)
 * @param {object} topic 
 * @returns {number} Score from 0 to 100
 */
const scoreTopic = (topic) => {
  let score = 50; // base score

  const keywords = ['llm', 'gpu', 'infrastructure', 'mlops', 'architecture', 'cluster', 'benchmark', 'scaling', 'model'];
  const text = (topic.title + ' ' + topic.description).toLowerCase();

  keywords.forEach(kw => {
    if (text.includes(kw)) score += 8;
  });

  return Math.min(100, Math.max(10, score));
};

/**
 * Evaluate all discovered topics, reject low value topics, and select ONLY ONE topic for publishing.
 * @returns {Promise<{ selectedTopic: object|null, evaluatedCount: number, rejectedCount: number }>}
 */
const makeEditorialDecision = async () => {
  logger.info('[Editorial Service] Evaluating discovered topics...');

  // Fetch pending discovered topics
  const discoveredTopics = await Topic.find({ status: 'discovered' }).sort({ createdAt: -1 });

  if (discoveredTopics.length === 0) {
    logger.info('[Editorial Service] No new discovered topics to evaluate.');
    return { selectedTopic: null, evaluatedCount: 0, rejectedCount: 0 };
  }

  let rejectedCount = 0;
  const scoredTopics = [];

  for (const topic of discoveredTopics) {
    const score = scoreTopic(topic);
    topic.relevanceScore = score;

    if (score < config.relevanceThreshold) {
      topic.status = 'rejected';
      await topic.save();
      rejectedCount++;
      logger.info(`[Editorial Service] Rejected Topic: "${topic.title}" (Score: ${score})`);
    } else {
      topic.status = 'evaluated';
      await topic.save();
      scoredTopics.push(topic);
    }
  }

  if (scoredTopics.length === 0) {
    logger.info('[Editorial Service] All discovered topics were rejected as below threshold.');
    return { selectedTopic: null, evaluatedCount: discoveredTopics.length, rejectedCount };
  }

  // Sort accepted topics by score descending and select ONLY ONE for publishing
  scoredTopics.sort((a, b) => b.relevanceScore - a.relevanceScore);
  const selectedTopic = scoredTopics[0];

  selectedTopic.status = 'accepted';
  await selectedTopic.save();

  logger.info(`[Editorial Service] Selected ONE Topic for Publishing: "${selectedTopic.title}" (Score: ${selectedTopic.relevanceScore})`);

  return {
    selectedTopic,
    evaluatedCount: discoveredTopics.length,
    rejectedCount
  };
};

module.exports = { makeEditorialDecision, scoreTopic };
