/**
 * Persona Routes
 * 
 * Responsibility:
 * Maps HTTP routes for AI persona retrieval and updates.
 */

const express = require('express');
const router = express.Router();
const personaController = require('../controllers/persona.controller');

router.get('/', personaController.getPersona);
router.put('/', personaController.updatePersona);

module.exports = router;
