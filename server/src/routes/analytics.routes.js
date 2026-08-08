const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');

router.get('/overview', analyticsController.overview);
router.get('/activity', analyticsController.activity);
router.get('/topics', analyticsController.topicStats);
router.get('/posts', analyticsController.postStats);

module.exports = router;
