const Topic = require('../models/Topic');
const Post = require('../models/Post');
const ActivityLog = require('../models/ActivityLog');
const Memory = require('../models/Memory');

const overview = async (req, res, next) => {
  try {
    const [
      totalTopics,
      acceptedTopics,
      totalPosts,
      publishedPosts,
      draftPosts,
      totalMemories,
      recentActivity,
    ] = await Promise.all([
      Topic.countDocuments(),
      Topic.countDocuments({ status: 'accepted' }),
      Post.countDocuments(),
      Post.countDocuments({ status: 'published' }),
      Post.countDocuments({ status: 'draft' }),
      Memory.countDocuments(),
      ActivityLog.find().sort({ timestamp: -1 }).limit(10),
    ]);

    // Get topics discovered per day (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const topicsPerDay = await Topic.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const postsPerDay = await Post.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      data: {
        metrics: {
          totalTopics,
          acceptedTopics,
          totalPosts,
          publishedPosts,
          draftPosts,
          totalMemories,
        },
        charts: { topicsPerDay, postsPerDay },
        recentActivity,
      },
    });
  } catch (error) {
    next(error);
  }
};

const activity = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const type = req.query.type;
    const query = type ? { type } : {};

    const logs = await ActivityLog.find(query).sort({ timestamp: -1 }).limit(limit);
    res.json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
};

const topicStats = async (req, res, next) => {
  try {
    const stats = await Topic.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const sourceStats = await Topic.aggregate([
      { $group: { _id: '$source', count: { $sum: 1 }, avgScore: { $avg: '$relevanceScore' } } },
    ]);

    res.json({ success: true, data: { statusBreakdown: stats, sourceBreakdown: sourceStats } });
  } catch (error) {
    next(error);
  }
};

const postStats = async (req, res, next) => {
  try {
    const stats = await Post.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const modelStats = await Post.aggregate([
      { $group: { _id: '$generationMeta.model', count: { $sum: 1 }, avgTokens: { $avg: '$generationMeta.tokensUsed' } } },
    ]);

    res.json({ success: true, data: { statusBreakdown: stats, modelBreakdown: modelStats } });
  } catch (error) {
    next(error);
  }
};

module.exports = { overview, activity, topicStats, postStats };
