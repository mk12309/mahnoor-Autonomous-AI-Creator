/**
 * Topic Routes
 * 
 * Responsibility:
 * Maps HTTP routes for topic listing and discovery to Topic Controller functions.
 */

const express = require('express');
const router = express.Router();
const topicController = require('../controllers/topic.controller');

router.get('/', topicController.getTopics);
router.post('/discover', topicController.discoverTopics);

module.exports = router;
