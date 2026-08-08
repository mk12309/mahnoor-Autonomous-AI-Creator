const express = require('express');
const router = express.Router();
const publishController = require('../controllers/publish.controller');

router.post('/:postId', publishController.publish);
router.get('/status/:postId', publishController.status);

module.exports = router;
