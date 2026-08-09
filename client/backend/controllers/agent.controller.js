/**
 * Agent Controller
 *
 * POST /api/agent/init
 *   — Creates persona, runs the full agent cycle synchronously, returns agentId.
 *   — On Vercel serverless, we MUST await the cycle before responding
 *     because background tasks are killed when the response is sent.
 *
 * GET /api/agent/feed?agentId=<id>
 *   — Returns published posts in reverse chronological order.
 */

const PersonaConfig = require('../models/PersonaConfig');
const Post = require('../models/Post');
const { getNextScheduledRun } = require('../scheduler/cron');
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

    // VERCEL FIX: Run cycle synchronously before responding.
    // On serverless, background tasks (fire-and-forget) are killed
    // the moment res.json() is sent, so the cycle would never complete.
    logger.info('[Agent API] Running initial agent cycle synchronously...');
    try {
      await runAgentCycle();
    } catch (cycleErr) {
      // Cycle errors are non-fatal — agent is still initialized
      logger.warn(`[Agent API] Cycle warning: ${cycleErr.message}`);
    }

    res.status(200).json({ agentId });
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

    const posts = await Post.find({ status: 'published' })
      .sort({ createdAt: -1 })
      .lean();

    const totalPosts = posts ? posts.length : 0;
    const lastPublishedAt =
      totalPosts > 0 && posts[0].createdAt
        ? new Date(posts[0].createdAt).toISOString()
        : null;

    const nextScheduledRun = getNextScheduledRun();

    if (!posts || posts.length === 0) {
      return res.status(200).json({
        posts: [],
        totalPosts: 0,
        lastPublishedAt: null,
        nextScheduledRun,
        currentPersona,
      });
    }

    const formattedPosts = posts.map((post) => {
      const createdAtDate = post.createdAt ? new Date(post.createdAt) : new Date();
      const sources =
        post.sources && post.sources.length > 0
          ? post.sources.map((s) => ({ title: s.title || 'Tech Source', url: s.url || '' }))
          : [{ title: 'SignalForge Live Stream', url: 'https://signalforge.ai' }];

      return {
        id: post._id.toString(),
        createdAt: createdAtDate.toISOString(),
        text: post.text || post.content || '',
        rationale: post.rationale || 'Selected based on high AI infrastructure relevance score.',
        sources,
      };
    });

    res.status(200).json({
      posts: formattedPosts,
      totalPosts,
      lastPublishedAt,
      nextScheduledRun,
      currentPersona,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { initAgent, getAgentFeed };
