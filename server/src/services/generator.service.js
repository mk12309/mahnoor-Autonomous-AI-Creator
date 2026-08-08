const Post = require('../models/Post');
const Topic = require('../models/Topic');
const Memory = require('../models/Memory');
const PersonaConfig = require('../models/PersonaConfig');
const { generateContent } = require('../config/ai');
const { buildGeneratorPrompt } = require('../prompts/generator.prompt');
const { generateFingerprint } = require('../utils/textSimilarity');
const logger = require('../utils/logger');

/**
 * Generate a LinkedIn post from an accepted topic
 * @param {string} topicId - ID of the topic to generate from
 * @returns {Promise<object>} Created post document
 */
const generatePost = async (topicId) => {
  const topic = await Topic.findById(topicId);
  if (!topic) throw new Error('Topic not found');

  const persona = (await PersonaConfig.findOne({ isActive: true })) || {
    name: 'AI Infrastructure Analyst',
    tone: 'professional',
    style: 'analytical',
    targetAudience: 'Tech professionals',
    postLength: 'medium',
    hashtagStrategy: '3-5 relevant hashtags',
    customInstructions: '',
    focusAreas: ['AI infrastructure', 'MLOps', 'LLMs'],
  };

  // Get recent memories for context
  const recentMemories = await Memory.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .select('summary');

  const memorySummaries = recentMemories.map((m) => m.summary).filter(Boolean);

  const prompt = buildGeneratorPrompt(topic, persona, memorySummaries);

  try {
    const response = await generateContent(prompt, { temperature: 0.8 });

    let generated;
    try {
      const cleanText = response.text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      generated = JSON.parse(cleanText);
    } catch (parseError) {
      logger.warn('Failed to parse generated post. Using raw text.');
      generated = {
        content: response.text,
        hashtags: [],
        summary: topic.title,
      };
    }

    // Create post
    const post = await Post.create({
      topicId: topic._id,
      content: generated.content,
      hashtags: generated.hashtags || [],
      status: 'draft',
      generationMeta: {
        model: response.model,
        promptVersion: 'v1',
        tokensUsed: response.tokensUsed,
      },
    });

    // Save to memory
    await Memory.create({
      postId: post._id,
      topicFingerprint: generateFingerprint(topic.title + ' ' + topic.description),
      keywords: generated.hashtags || [],
      summary: generated.summary || topic.title,
    });

    // Mark topic as used
    await Topic.findByIdAndUpdate(topicId, { status: 'used' });

    logger.info(`✍️ Generated post for "${topic.title}" (${response.model})`);

    return post;
  } catch (error) {
    logger.error(`Post generation failed for "${topic.title}":`, error.message);
    throw error;
  }
};

/**
 * Generate posts from all accepted topics
 * @returns {Promise<{generated: number, posts: Array}>}
 */
const generateFromAcceptedTopics = async () => {
  const topics = await Topic.find({ status: 'accepted' }).sort({ relevanceScore: -1 }).limit(5);

  logger.info(`✍️ Generating posts for ${topics.length} accepted topics...`);

  const posts = [];

  for (const topic of topics) {
    try {
      const post = await generatePost(topic._id);
      posts.push(post);
      // Delay between generations
      await new Promise((r) => setTimeout(r, 1000));
    } catch (error) {
      logger.error(`Skipping generation for: ${topic.title}`);
    }
  }

  logger.info(`✅ Generated ${posts.length} posts`);
  return { generated: posts.length, posts };
};

module.exports = { generatePost, generateFromAcceptedTopics };
