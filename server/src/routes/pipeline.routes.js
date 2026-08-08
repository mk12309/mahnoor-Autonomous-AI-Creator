const express = require('express');
const router = express.Router();
const pipelineController = require('../controllers/pipeline.controller');
const { aiLimiter } = require('../middleware/rateLimiter');

router.post('/run', aiLimiter, pipelineController.run);
router.get('/status', pipelineController.status);
router.post('/stop', pipelineController.stop);

module.exports = router;
