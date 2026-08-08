/**
 * Pipeline Controller
 * 
 * Responsibility:
 * Handles API endpoints for triggering the autonomous agent loop and checking pipeline status.
 */

const { runAgentCycle } = require('../services/agent.service');
const { getPublishedPosts } = require('../services/publisher.service');

const runPipeline = async (req, res, next) => {
  try {
    const result = await runAgentCycle();
    res.status(200).json({
      success: true,
      message: 'Autonomous Agent Cycle completed successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const getStatus = async (req, res, next) => {
  try {
    const publishedPosts = await getPublishedPosts(10);
    res.status(200).json({
      success: true,
      status: 'active',
      publishedCount: publishedPosts.length,
      recentPosts: publishedPosts
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { runPipeline, getStatus };
