const { discoverTopics, getTopics, getTopicById, updateTopicStatus } = require('../services/discovery.service');

const discover = async (req, res, next) => {
  try {
    const result = await discoverTopics();
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const list = async (req, res, next) => {
  try {
    const filters = {
      status: req.query.status,
      minScore: req.query.minScore ? parseInt(req.query.minScore) : undefined,
      page: req.query.page ? parseInt(req.query.page) : 1,
      limit: req.query.limit ? parseInt(req.query.limit) : 20,
    };
    const result = await getTopics(filters);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const topic = await getTopicById(req.params.id);
    if (!topic) return res.status(404).json({ success: false, error: 'Topic not found' });
    res.json({ success: true, data: topic });
  } catch (error) {
    next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const topic = await updateTopicStatus(req.params.id, status);
    if (!topic) return res.status(404).json({ success: false, error: 'Topic not found' });
    res.json({ success: true, data: topic });
  } catch (error) {
    next(error);
  }
};

module.exports = { discover, list, getById, updateStatus };
