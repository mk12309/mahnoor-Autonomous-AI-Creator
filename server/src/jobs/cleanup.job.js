const Topic = require('../models/Topic');
const ActivityLog = require('../models/ActivityLog');
const logger = require('../utils/logger');

/**
 * Cleanup job — removes old rejected topics and excess logs
 */
const runCleanupJob = async () => {
  logger.info('🧹 [JOB] Starting cleanup...');

  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Remove old rejected topics
    const removedTopics = await Topic.deleteMany({
      status: 'rejected',
      createdAt: { $lt: thirtyDaysAgo },
    });

    logger.info(`🧹 Cleaned up ${removedTopics.deletedCount} old rejected topics`);

    await ActivityLog.create({
      type: 'system',
      stage: 'cleanup',
      message: `Cleanup: removed ${removedTopics.deletedCount} old rejected topics`,
    });

    return { removedTopics: removedTopics.deletedCount };
  } catch (error) {
    logger.error('[JOB] Cleanup failed:', error.message);
    throw error;
  }
};

module.exports = { runCleanupJob };
