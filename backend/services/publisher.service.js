/**
 * Publishing Service
 * 
 * Responsibility:
 * Saves final posts into MongoDB.
 * Ensures every published post strictly includes:
 * - id
 * - createdAt
 * - text
 * - rationale
 * - sources
 * Also notifies the Memory Service to preserve publishing history and topics.
 */

const Post = require('../models/Post');
const memoryService = require('./memory.service');
const logger = require('../utils/logger');

/**
 * Save post to MongoDB with required fields
 * @param {object} payload - Post creation parameters
 * @returns {Promise<object>} Created Post document with id, createdAt, text, rationale, sources
 */
const saveAndPublishPost = async ({ topic, text, rationale, sources }) => {
  logger.info('[Publishing Service] Persisting published post to MongoDB...');

  // Format sources array
  const formattedSources = sources && sources.length > 0 
    ? sources 
    : [{ title: topic.source || 'Live Tech Feed', url: topic.sourceUrl || '' }];

  // Save into MongoDB Post Collection
  const postDoc = await Post.create({
    topicId: topic._id,
    text,
    rationale,
    sources: formattedSources,
    status: 'published',
    publishedAt: new Date()
  });

  // Record into persistent Memory Service
  await memoryService.recordPublishedTopic(topic.title, text.substring(0, 200));
  await memoryService.recordOpinion(topic.title, rationale);
  await memoryService.recordPublishingHistory(postDoc._id, text);

  logger.info(`[Publishing Service] Post successfully saved with ID: ${postDoc._id}`);

  return postDoc;
};

/**
 * Get all published posts
 */
const getPublishedPosts = async (limit = 20) => {
  return await Post.find({ status: 'published' })
    .sort({ createdAt: -1 })
    .limit(limit);
};

module.exports = { saveAndPublishPost, getPublishedPosts };
