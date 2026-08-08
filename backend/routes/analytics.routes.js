/**
 * Analytics Routes
 * 
 * Responsibility:
 * Maps HTTP routes for dashboard metrics and activity analytics.
 */

const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');

router.get('/overview', analyticsController.getOverview);

module.exports = router;
