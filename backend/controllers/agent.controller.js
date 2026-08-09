/**
 * Agent Controller — Resilient DB Handling
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

    let agentId = 'agent-signalforge-default';

    try {
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
      if (persona && persona._id) {
        agentId = `agent-${persona._id}`;
      }
    } catch (dbErr) {
      logger.warn(`[Agent API] DB initialization warning: ${dbErr.message}`);
    }

    logger.info('[Agent API] Running agent cycle synchronously...');
    let cycleResult = null;
    try {
      cycleResult = await runAgentCycle();
    } catch (cycleErr) {
      logger.warn(`[Agent API] Cycle warning: ${cycleErr.message}`);
    }

    res.status(200).json({ agentId, cycleResult });
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

    let currentPersona = {
      name: 'SignalForge AI',
      title: 'Autonomous AI Infrastructure Analyst',
      voice: 'Professional, analytical, authoritative, data-backed',
    };

    let posts = [];

    try {
      const persona = await PersonaConfig.findOne({ isActive: true });
      if (persona) {
        currentPersona.name = persona.name;
      }
      posts = await Post.find({ status: 'published' })
        .sort({ createdAt: -1 })
        .lean();
    } catch (dbErr) {
      logger.warn(`[Agent API] DB fetch warning: ${dbErr.message}`);
    }

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
        id: post._id ? post._id.toString() : `post-${Date.now()}`,
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
