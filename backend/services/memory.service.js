/**
 * Memory Service
 * 
 * Responsibility:
 * Manages persistent memory state for SignalForge AI in MongoDB, tracking:
 * 1. Previous published topics
 * 2. Previous opinions
 * 3. Previously rejected topics
 * 4. Writing style guidelines
 * 5. Publishing history
 */

const Memory = require('../models/Memory');
const logger = require('../utils/logger');

/**
 * Record a published topic into Memory
 */
const recordPublishedTopic = async (topicTitle, summary) => {
  return await Memory.create({
    type: 'published_topic',
    topicTitle,
    summaryOrContent: summary,
    reasoningOrTone: 'Published as top editorial selection'
  });
};

/**
 * Record an opinion or analytical stance
 */
const recordOpinion = async (topicTitle, opinionText) => {
  return await Memory.create({
    type: 'opinion',
    topicTitle,
    summaryOrContent: opinionText,
    reasoningOrTone: 'AI Infrastructure Analyst perspective'
  });
};

/**
 * Record a rejected topic and rationale
 */
const recordRejectedTopic = async (topicTitle, reason) => {
  return await Memory.create({
    type: 'rejected_topic',
    topicTitle,
    summaryOrContent: reason,
    reasoningOrTone: 'Below relevance threshold or duplicate'
  });
};

/**
 * Record an entry into Publishing History
 */
const recordPublishingHistory = async (postId, postText) => {
  return await Memory.create({
    type: 'publishing_history',
    summaryOrContent: postText.substring(0, 150) + '...',
    metadata: { postId }
  });
};

/**
 * Save/Get Writing Style guidelines
 */
const getWritingStyleGuidelines = async () => {
  let styleMemory = await Memory.findOne({ type: 'writing_style' });
  if (!styleMemory) {
    styleMemory = await Memory.create({
      type: 'writing_style',
      summaryOrContent: 'Analytical, authoritative, structured with bulleted takeaways, technical accuracy',
      reasoningOrTone: 'SignalForge AI Analyst Persona Default'
    });
  }
  return styleMemory;
};

/**
 * Retrieve recent published topic titles for deduplication and prompt context
 */
const getRecentPublishedTopics = async (limit = 20) => {
  const records = await Memory.find({ type: 'published_topic' })
    .sort({ timestamp: -1 })
    .limit(limit);
  return records.map((r) => r.topicTitle).filter(Boolean);
};

/**
 * Check if a title or fingerprint is a duplicate of a previously published topic
 */
const isTopicDuplicate = async (title) => {
  if (!title) return false;

  const normalizedNew = title.toLowerCase().replace(/[^a-z0-9]/g, '');

  const previousTitles = await getRecentPublishedTopics(50);
  for (const prevTitle of previousTitles) {
    const normalizedPrev = prevTitle.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (normalizedNew === normalizedPrev || (normalizedNew.length > 15 && normalizedPrev.includes(normalizedNew))) {
      return true;
    }
  }

  return false;
};

/**
 * Retrieve recent publishing history
 */
const getPublishingHistory = async (limit = 20) => {
  return await Memory.find({ type: 'publishing_history' })
    .sort({ timestamp: -1 })
    .limit(limit);
};

/**
 * Retrieve recent rejected topics
 */
const getRejectedTopics = async (limit = 20) => {
  return await Memory.find({ type: 'rejected_topic' })
    .sort({ timestamp: -1 })
    .limit(limit);
};

module.exports = {
  recordPublishedTopic,
  recordOpinion,
  recordRejectedTopic,
  recordPublishingHistory,
  getWritingStyleGuidelines,
  getRecentPublishedTopics,
  isTopicDuplicate,
  getPublishingHistory,
  getRejectedTopics
};
