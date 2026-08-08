const Topic = require('../models/Topic');
const { parseMultipleFeeds } = require('../utils/rssParser');
const { checkSimilarity } = require('../utils/textSimilarity');
const { env } = require('../config/env');
const logger = require('../utils/logger');

/**
 * Discover topics from configured RSS feeds
 * @returns {Promise<{discovered: number, duplicates: number, topics: Array}>}
 */
const discoverTopics = async () => {
  logger.info('🔍 Starting topic discovery...');

  const feedUrls = env.RSS_FEEDS;
  const rawItems = await parseMultipleFeeds(feedUrls);

  logger.info(`Fetched ${rawItems.length} items from ${feedUrls.length} feeds`);

  let discovered = 0;
  let duplicates = 0;
  const newTopics = [];

  for (const item of rawItems) {
    try {
      // Check if topic already exists by URL
      const exists = await Topic.findOne({ sourceUrl: item.sourceUrl });
      if (exists) {
        duplicates++;
        continue;
      }

      // Check title similarity against recent topics
      const recentTopics = await Topic.find()
        .sort({ createdAt: -1 })
        .limit(50)
        .select('title');

      const recentTitles = recentTopics.map((t) => t.title);

      if (recentTitles.length > 0) {
        const { isDuplicate } = checkSimilarity(item.title, recentTitles, 0.7);
        if (isDuplicate) {
          duplicates++;
          continue;
        }
      }

      // Save new topic
      const topic = await Topic.create({
        title: item.title,
        description: item.description.substring(0, 500),
        source: item.source,
        sourceUrl: item.sourceUrl,
        tags: item.categories || [],
        discoveredAt: item.publishedAt || new Date(),
      });

      newTopics.push(topic);
      discovered++;
    } catch (error) {
      // Skip duplicates silently (unique constraint)
      if (error.code === 11000) {
        duplicates++;
        continue;
      }
      logger.error(`Error saving topic: ${item.title}`, error.message);
    }
  }

  logger.info(`✅ Discovery complete: ${discovered} new, ${duplicates} duplicates`);

  return { discovered, duplicates, topics: newTopics };
};

/**
 * Get topics with optional filters
 */
const getTopics = async (filters = {}) => {
  const query = {};

  if (filters.status) query.status = filters.status;
  if (filters.minScore) query.relevanceScore = { $gte: filters.minScore };

  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const skip = (page - 1) * limit;

  const [topics, total] = await Promise.all([
    Topic.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Topic.countDocuments(query),
  ]);

  return { topics, total, page, totalPages: Math.ceil(total / limit) };
};

/**
 * Get a single topic by ID
 */
const getTopicById = async (id) => {
  return Topic.findById(id);
};

/**
 * Update topic status
 */
const updateTopicStatus = async (id, status) => {
  return Topic.findByIdAndUpdate(id, { status }, { new: true });
};

module.exports = { discoverTopics, getTopics, getTopicById, updateTopicStatus };
