const { discoverTopics } = require('./discovery.service');
const { evaluateDiscoveredTopics } = require('./evaluator.service');
const { generateFromAcceptedTopics } = require('./generator.service');
const { publishPost } = require('./publisher.service');
const Post = require('../models/Post');
const ActivityLog = require('../models/ActivityLog');
const { env } = require('../config/env');
const { PIPELINE_STAGES, LOG_TYPES } = require('../utils/constants');
const logger = require('../utils/logger');

// Pipeline state
let pipelineState = {
  status: PIPELINE_STAGES.IDLE,
  currentStage: null,
  lastRun: null,
  lastResult: null,
  isRunning: false,
};

/**
 * Log a pipeline activity
 */
const logActivity = async (type, stage, message, metadata = {}) => {
  try {
    await ActivityLog.create({ type, stage, message, metadata });
  } catch (err) {
    logger.error('Failed to log activity:', err.message);
  }
};

/**
 * Run the full content pipeline
 * @returns {Promise<object>} Pipeline results
 */
const runPipeline = async () => {
  if (pipelineState.isRunning) {
    throw new Error('Pipeline is already running');
  }

  pipelineState.isRunning = true;
  pipelineState.status = PIPELINE_STAGES.DISCOVERING;
  const startTime = Date.now();
  const results = {};

  try {
    // Stage 1: Discover
    pipelineState.currentStage = 'discover';
    await logActivity(LOG_TYPES.PIPELINE, 'discover', '🔍 Starting topic discovery...');
    results.discovery = await discoverTopics();
    await logActivity(LOG_TYPES.DISCOVERY, 'discover', 
      `Found ${results.discovery.discovered} new topics`, results.discovery);

    // Stage 2: Evaluate
    pipelineState.status = PIPELINE_STAGES.EVALUATING;
    pipelineState.currentStage = 'evaluate';
    await logActivity(LOG_TYPES.PIPELINE, 'evaluate', '⚖️ Evaluating discovered topics...');
    results.evaluation = await evaluateDiscoveredTopics();
    await logActivity(LOG_TYPES.EVALUATION, 'evaluate',
      `Evaluated ${results.evaluation.evaluated} topics: ${results.evaluation.accepted} accepted`, results.evaluation);

    // Stage 3: Generate
    pipelineState.status = PIPELINE_STAGES.GENERATING;
    pipelineState.currentStage = 'generate';
    await logActivity(LOG_TYPES.PIPELINE, 'generate', '✍️ Generating posts...');
    results.generation = await generateFromAcceptedTopics();
    await logActivity(LOG_TYPES.GENERATION, 'generate',
      `Generated ${results.generation.generated} posts`, { generated: results.generation.generated });

    // Stage 4: Auto-publish (if enabled)
    if (env.AUTO_APPROVE) {
      pipelineState.status = PIPELINE_STAGES.PUBLISHING;
      pipelineState.currentStage = 'publish';
      await logActivity(LOG_TYPES.PIPELINE, 'publish', '🚀 Auto-publishing approved posts...');

      const drafts = await Post.find({ status: 'draft' }).sort({ createdAt: -1 }).limit(3);
      let published = 0;

      for (const draft of drafts) {
        try {
          await Post.findByIdAndUpdate(draft._id, { status: 'approved' });
          await publishPost(draft._id);
          published++;
        } catch (err) {
          logger.error(`Failed to publish post ${draft._id}:`, err.message);
        }
      }

      results.publishing = { published };
      await logActivity(LOG_TYPES.PUBLISH, 'publish', `Published ${published} posts`);
    }

    // Complete
    pipelineState.status = PIPELINE_STAGES.COMPLETED;
    pipelineState.currentStage = null;
    pipelineState.lastRun = new Date();
    pipelineState.lastResult = results;

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    await logActivity(LOG_TYPES.PIPELINE, 'complete',
      `✅ Pipeline completed in ${duration}s`, { duration, results });

    logger.info(`✅ Pipeline completed in ${duration}s`);

    return results;
  } catch (error) {
    pipelineState.status = PIPELINE_STAGES.ERROR;
    await logActivity(LOG_TYPES.ERROR, pipelineState.currentStage || 'unknown',
      `❌ Pipeline error: ${error.message}`, { error: error.message });
    logger.error('Pipeline error:', error.message);
    throw error;
  } finally {
    pipelineState.isRunning = false;
  }
};

/**
 * Get current pipeline status
 */
const getPipelineStatus = () => {
  return { ...pipelineState };
};

/**
 * Stop a running pipeline (best-effort)
 */
const stopPipeline = () => {
  if (pipelineState.isRunning) {
    pipelineState.isRunning = false;
    pipelineState.status = PIPELINE_STAGES.IDLE;
    pipelineState.currentStage = null;
    logger.info('⏹️ Pipeline stop requested');
    return true;
  }
  return false;
};

module.exports = { runPipeline, getPipelineStatus, stopPipeline };
