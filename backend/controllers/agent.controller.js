/**
 * Agent Controller
 * 
 * Implements hackathon API endpoints with enhanced production capabilities:
 * 
 * 1. POST /api/agent/init
 *    - Behavior: Initializes agent once, saves persona, starts autonomous scheduler.
 *    - Returns: { "agentId": "<generated-id>" }
 * 
 * 2. GET /api/agent/feed?agentId=<id>
 *    - Behavior: Returns posts in reverse chronological order (newest first).
 *    - Extended fields:
 *      posts: array of { id, createdAt, text, rationale, sources }
 *      totalPosts: number
 *      lastPublishedAt: string (ISO 8601 UTC) or null
 *      nextScheduledRun: string (ISO 8601 UTC)
 *      currentPersona: { name, title, voice }
 */

const PersonaConfig = require('../models/PersonaConfig');
const Post = require('../models/Post');
const { initCron, getNextScheduledRun } = require('../scheduler/cron');
const { runAgentCycle } = require('../services/agent.service');
const logger = require('../utils/logger');

/**
 * POST /api/agent/init
 */
const initAgent = async (req, res, next) => {
  try {
    logger.info('[Agent API] Initializing SignalForge AI Agent...');

    let persona = await PersonaConfig.findOne({ isActive: true });
    if (!persona) {
      persona = await PersonaConfig.create({
        name: 'SignalForge AI',
        tone: 'professional',
        style: 'analytical',
        targetAudience: 'Tech Professionals, CTOs, AI Infrastructure Engineers',
        postLength: 'medium',
        focusAreas: ['AI Infrastructure', 'GPU Scaling', 'MLOps', 'LLM Serving'],
        isActive: true,
      });
    }

    const agentId = `agent-${persona._id}`;

    // Start Autonomous Scheduler
    initCron();

    // Trigger initial background cycle
    runAgentCycle().catch((err) => {
      logger.warn(`[Agent API] Initial background cycle execution: ${err.message}`);
    });

    res.status(200).json({
      agentId: agentId,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/agent/feed?agentId=<id>
 */
const getAgentFeed = async (req, res, next) => {
  try {
    const { agentId } = req.query;

    logger.info(`[Agent API] Fetching feed for agentId: ${agentId || 'default'}`);

    const persona = await PersonaConfig.findOne({ isActive: true });
    const currentPersona = {
      name: persona ? persona.name : 'SignalForge AI',
      title: 'Autonomous AI Infrastructure Analyst',
      voice: 'Professional, analytical, authoritative, data-backed',
    };

    // Query published posts ordered newest first (reverse chronological)
    const posts = await Post.find({ status: 'published' })
      .sort({ createdAt: -1 })
      .lean();

    const totalPosts = posts ? posts.length : 0;
    const lastPublishedAt = totalPosts > 0 && posts[0].createdAt
      ? new Date(posts[0].createdAt).toISOString()
      : null;

    const nextScheduledRun = getNextScheduledRun();

    if (!posts || posts.length === 0) {
      return res.status(200).json({
        posts: [],
        totalPosts: 0,
        lastPublishedAt: null,
        nextScheduledRun: nextScheduledRun,
        currentPersona: currentPersona,
      });
    }

    // Format feed items strictly to hackathon spec:
    // id, createdAt (ISO 8601 UTC), text, rationale, sources
    const formattedPosts = posts.map((post) => {
      const createdAtDate = post.createdAt ? new Date(post.createdAt) : new Date();

      const sources = (post.sources && post.sources.length > 0)
        ? post.sources.map((s) => ({
            title: s.title || 'Tech Source',
            url: s.url || '',
          }))
        : [{ title: 'SignalForge Live Stream', url: 'https://signalforge.ai' }];

      return {
        id: post._id.toString(),
        createdAt: createdAtDate.toISOString(),
        text: post.text || post.content || '',
        rationale: post.rationale || 'Selected based on high AI infrastructure relevance score.',
        sources: sources,
      };
    });

    res.status(200).json({
      posts: formattedPosts,
      totalPosts: totalPosts,
      lastPublishedAt: lastPublishedAt,
      nextScheduledRun: nextScheduledRun,
      currentPersona: currentPersona,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  initAgent,
  getAgentFeed,
};
