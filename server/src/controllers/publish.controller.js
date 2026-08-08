const { publishPost, getPublishStatus } = require('../services/publisher.service');

const publish = async (req, res, next) => {
  try {
    const post = await publishPost(req.params.postId);
    res.json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};

const status = async (req, res, next) => {
  try {
    const result = await getPublishStatus(req.params.postId);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

module.exports = { publish, status };
