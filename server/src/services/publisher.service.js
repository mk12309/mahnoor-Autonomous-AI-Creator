const Post = require('../models/Post');
const axios = require('axios');
const { env } = require('../config/env');
const logger = require('../utils/logger');

/**
 * Publish a post to LinkedIn
 * @param {string} postId - Post document ID
 * @returns {Promise<object>} Published post with LinkedIn ID
 */
const publishPost = async (postId) => {
  const post = await Post.findById(postId);
  if (!post) throw new Error('Post not found');
  if (post.status === 'published') throw new Error('Post is already published');

  const fullContent = `${post.content}\n\n${post.hashtags.map((h) => `#${h}`).join(' ')}`;

  try {
    let linkedinPostId = null;

    if (env.LINKEDIN_ACCESS_TOKEN && env.LINKEDIN_ACCESS_TOKEN !== 'your_token') {
      // Real LinkedIn API call
      const response = await axios.post(
        'https://api.linkedin.com/v2/ugcPosts',
        {
          author: `urn:li:person:${env.LINKEDIN_PERSON_URN}`,
          lifecycleState: 'PUBLISHED',
          specificContent: {
            'com.linkedin.ugc.ShareContent': {
              shareCommentary: { text: fullContent },
              shareMediaCategory: 'NONE',
            },
          },
          visibility: {
            'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
          },
        },
        {
          headers: {
            Authorization: `Bearer ${env.LINKEDIN_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0',
          },
        }
      );

      linkedinPostId = response.headers['x-restli-id'] || response.data.id;
      logger.info(`🚀 Published to LinkedIn: ${linkedinPostId}`);
    } else {
      // Mock mode
      linkedinPostId = `mock-${Date.now()}`;
      logger.info(`🚀 [MOCK] Published post: ${linkedinPostId}`);
    }

    // Update post status
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      {
        status: 'published',
        publishedAt: new Date(),
        linkedinPostId,
      },
      { new: true }
    );

    return updatedPost;
  } catch (error) {
    logger.error(`Publishing failed for post ${postId}:`, error.message);
    throw error;
  }
};

/**
 * Get publishing status for a post
 */
const getPublishStatus = async (postId) => {
  const post = await Post.findById(postId).select('status publishedAt linkedinPostId');
  if (!post) throw new Error('Post not found');
  return post;
};

module.exports = { publishPost, getPublishStatus };
