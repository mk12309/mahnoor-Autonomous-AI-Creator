/**
 * Route Index Aggregator
 * 
 * Responsibility:
 * Aggregates all modular sub-routes into a single unified Express Router.
 */

const express = require('express');
const router = express.Router();

const agentRoutes = require('./agent.routes');
const topicRoutes = require('./topic.routes');
const postRoutes = require('./post.routes');
const pipelineRoutes = require('./pipeline.routes');
const personaRoutes = require('./persona.routes');
const analyticsRoutes = require('./analytics.routes');
const debugRoutes = require('./debug.routes');

// Hackathon Agent Endpoints (/api/agent/init, /api/agent/feed)
router.use('/agent', agentRoutes);

// Detailed Feature Routes
router.use('/topics', topicRoutes);
router.use('/posts', postRoutes);
router.use('/pipeline', pipelineRoutes);
router.use('/persona', personaRoutes);
router.use('/analytics', analyticsRoutes);

// Development Debug Routes (disabled in production by controller)
router.use('/debug', debugRoutes);

module.exports = router;
