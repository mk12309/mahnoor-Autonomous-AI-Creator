const express = require('express');
const router = express.Router();
const personaController = require('../controllers/persona.controller');
const { aiLimiter } = require('../middleware/rateLimiter');

router.get('/', personaController.get);
router.put('/', personaController.update);
router.post('/preview', aiLimiter, personaController.preview);

module.exports = router;
