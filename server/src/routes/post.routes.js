const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller');
const { aiLimiter } = require('../middleware/rateLimiter');

router.get('/', postController.list);
router.get('/:id', postController.getById);
router.post('/generate', aiLimiter, postController.generate);
router.patch('/:id', postController.update);
router.patch('/:id/approve', postController.approve);
router.patch('/:id/reject', postController.reject);
router.delete('/:id', postController.remove);

module.exports = router;
