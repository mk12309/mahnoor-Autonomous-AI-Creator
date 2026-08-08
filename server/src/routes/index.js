const express = require('express');
const router = express.Router();

const topicRoutes = require('./topic.routes');
const postRoutes = require('./post.routes');
const pipelineRoutes = require('./pipeline.routes');
const personaRoutes = require('./persona.routes');
const analyticsRoutes = require('./analytics.routes');
const publishRoutes = require('./publish.routes');

router.use('/topics', topicRoutes);
router.use('/posts', postRoutes);
router.use('/pipeline', pipelineRoutes);
router.use('/persona', personaRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/publish', publishRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'SignalForge AI API is running',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
