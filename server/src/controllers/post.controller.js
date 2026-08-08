const Post = require('../models/Post');
const { generatePost } = require('../services/generator.service');

const list = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.status) query.status = req.query.status;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      Post.find(query).populate('topicId', 'title source').sort({ createdAt: -1 }).skip(skip).limit(limit),
      Post.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: { posts, total, page, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate('topicId', 'title source sourceUrl');
    if (!post) return res.status(404).json({ success: false, error: 'Post not found' });
    res.json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};

const generate = async (req, res, next) => {
  try {
    const { topicId } = req.body;
    if (!topicId) return res.status(400).json({ success: false, error: 'topicId is required' });
    const post = await generatePost(topicId);
    res.status(201).json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const { content, hashtags } = req.body;
    const updateData = {};
    if (content) updateData.content = content;
    if (hashtags) updateData.hashtags = hashtags;

    const post = await Post.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!post) return res.status(404).json({ success: false, error: 'Post not found' });
    res.json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};

const approve = async (req, res, next) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
    if (!post) return res.status(404).json({ success: false, error: 'Post not found' });
    res.json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};

const reject = async (req, res, next) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true });
    if (!post) return res.status(404).json({ success: false, error: 'Post not found' });
    res.json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ success: false, error: 'Post not found' });
    res.json({ success: true, message: 'Post deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { list, getById, generate, update, approve, reject, remove };
