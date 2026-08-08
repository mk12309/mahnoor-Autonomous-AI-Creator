/**
 * Pipeline Routes
 * 
 * Responsibility:
 * Maps HTTP routes for autonomous pipeline execution and status queries.
 */

const express = require('express');
const router = express.Router();
const pipelineController = require('../controllers/pipeline.controller');

router.post('/run', pipelineController.runPipeline);
router.get('/status', pipelineController.getStatus);

module.exports = router;
