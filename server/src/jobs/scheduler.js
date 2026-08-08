const cron = require('node-cron');
const { env } = require('../config/env');
const logger = require('../utils/logger');

let scheduledJobs = {};

/**
 * Initialize and start all scheduled jobs
 */
const initScheduler = (jobs) => {
  // Discovery job
  if (jobs.discovery) {
    scheduledJobs.discovery = cron.schedule(env.DISCOVERY_CRON, async () => {
      logger.info('⏰ [CRON] Running scheduled topic discovery...');
      try {
        await jobs.discovery();
      } catch (err) {
        logger.error('[CRON] Discovery job failed:', err.message);
      }
    }, { scheduled: false });
  }

  // Full pipeline job
  if (jobs.pipeline) {
    scheduledJobs.pipeline = cron.schedule(env.PIPELINE_CRON, async () => {
      logger.info('⏰ [CRON] Running scheduled pipeline...');
      try {
        await jobs.pipeline();
      } catch (err) {
        logger.error('[CRON] Pipeline job failed:', err.message);
      }
    }, { scheduled: false });
  }

  // Cleanup job — runs daily at midnight
  if (jobs.cleanup) {
    scheduledJobs.cleanup = cron.schedule('0 0 * * *', async () => {
      logger.info('⏰ [CRON] Running cleanup...');
      try {
        await jobs.cleanup();
      } catch (err) {
        logger.error('[CRON] Cleanup job failed:', err.message);
      }
    }, { scheduled: false });
  }

  logger.info('✅ Scheduler initialized');
};

/**
 * Start all scheduled jobs
 */
const startAll = () => {
  Object.entries(scheduledJobs).forEach(([name, job]) => {
    job.start();
    logger.info(`▶️ Started job: ${name}`);
  });
};

/**
 * Stop all scheduled jobs
 */
const stopAll = () => {
  Object.entries(scheduledJobs).forEach(([name, job]) => {
    job.stop();
    logger.info(`⏹️ Stopped job: ${name}`);
  });
};

/**
 * Get scheduler status
 */
const getStatus = () => {
  return Object.entries(scheduledJobs).map(([name, job]) => ({
    name,
    running: job.options?.scheduled !== false,
  }));
};

module.exports = { initScheduler, startAll, stopAll, getStatus };
