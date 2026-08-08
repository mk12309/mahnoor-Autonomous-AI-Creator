/**
 * Post Routes
 * 
 * Responsibility:
 * Maps HTTP routes for post retrieval and post generation to Post Controller functions.
 */

const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller');

router.get('/', postController.getPosts);
router.post('/generate', postController.generatePost);

module.exports = router;
