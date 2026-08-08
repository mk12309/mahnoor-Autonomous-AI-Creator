const { runPipeline } = require('../services/pipeline.service');
const logger = require('../utils/logger');

/**
 * Scheduled pipeline job — runs the full content pipeline
 */
const runPipelineJob = async () => {
  logger.info('🔄 [JOB] Starting scheduled pipeline...');

  try {
    const result = await runPipeline();
    return result;
  } catch (error) {
    logger.error('[JOB] Pipeline job failed:', error.message);
    throw error;
  }
};

module.exports = { runPipelineJob };
