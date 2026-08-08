/**
 * routes/debug.routes.js
 *
 * Development-only debug routes.
 * Protected: disabled in production by the controller itself.
 *
 * GET /api/debug/breeth — performs real Breeth WRITE + READ
 */

const express = require('express');
const router = express.Router();
const debugController = require('../controllers/debug.controller');

router.get('/breeth', debugController.testBreeth);

module.exports = router;
