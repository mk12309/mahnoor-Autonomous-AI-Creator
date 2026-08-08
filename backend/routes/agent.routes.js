/**
 * Agent Routes
 * 
 * Maps hackathon required API endpoints:
 * - POST /api/agent/init -> agentController.initAgent
 * - GET  /api/agent/feed -> agentController.getAgentFeed
 */

const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agent.controller');

router.post('/init', agentController.initAgent);
router.get('/feed', agentController.getAgentFeed);

module.exports = router;
