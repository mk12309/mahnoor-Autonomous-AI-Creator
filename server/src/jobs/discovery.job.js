const { discoverTopics } = require('../services/discovery.service');
const ActivityLog = require('../models/ActivityLog');
const logger = require('../utils/logger');

/**
 * Scheduled discovery job — discovers new topics from RSS feeds
 */
const runDiscoveryJob = async () => {
  logger.info('🔍 [JOB] Starting scheduled discovery...');

  try {
    const result = await discoverTopics();

    await ActivityLog.create({
      type: 'discovery',
      stage: 'scheduled',
      message: `Scheduled discovery: ${result.discovered} new topics found`,
      metadata: result,
    });

    return result;
  } catch (error) {
    logger.error('[JOB] Discovery failed:', error.message);
    await ActivityLog.create({
      type: 'error',
      stage: 'discovery',
      message: `Scheduled discovery failed: ${error.message}`,
    });
    throw error;
  }
};

module.exports = { runDiscoveryJob };
