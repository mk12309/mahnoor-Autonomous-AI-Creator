const express = require('express');
const router = express.Router();
const topicController = require('../controllers/topic.controller');

router.get('/', topicController.list);
router.get('/:id', topicController.getById);
router.post('/discover', topicController.discover);
router.patch('/:id/status', topicController.updateStatus);

module.exports = router;
