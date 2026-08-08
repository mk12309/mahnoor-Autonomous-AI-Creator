const Topic = require('../models/Topic');
const PersonaConfig = require('../models/PersonaConfig');
const { generateContent } = require('../config/ai');
const { buildEvaluatorPrompt } = require('../prompts/evaluator.prompt');
const { env } = require('../config/env');
const logger = require('../utils/logger');

/**
 * Evaluate a single topic using AI
 * @param {object} topic - Topic document
 * @returns {Promise<object>} Updated topic with score
 */
const evaluateTopic = async (topic) => {
  const persona = await PersonaConfig.findOne({ isActive: true }) || { 
    name: 'AI Infrastructure Analyst',
    focusAreas: ['AI infrastructure', 'MLOps', 'LLMs'],
    targetAudience: 'Tech professionals',
    avoidTopics: [],
  };

  const prompt = buildEvaluatorPrompt(topic, persona);

  try {
    const response = await generateContent(prompt, { temperature: 0.3 });
    
    // Parse AI response
    let evaluation;
    try {
      // Clean the response — remove markdown code blocks if present
      const cleanText = response.text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      evaluation = JSON.parse(cleanText);
    } catch (parseError) {
      logger.warn(`Failed to parse evaluation for "${topic.title}". Using default score.`);
      evaluation = { score: 50, reasoning: 'Parse error — defaulting', tags: [], category: 'news' };
    }

    // Update topic with evaluation results
    const updatedTopic = await Topic.findByIdAndUpdate(
      topic._id,
      {
        relevanceScore: Math.min(100, Math.max(0, evaluation.score)),
        status: evaluation.score >= env.RELEVANCE_THRESHOLD ? 'accepted' : 'rejected',
        tags: evaluation.tags || topic.tags,
        evaluatedAt: new Date(),
      },
      { new: true }
    );

    logger.info(
      `⚖️ Evaluated "${topic.title}" → Score: ${evaluation.score} (${updatedTopic.status})`
    );

    return { topic: updatedTopic, evaluation };
  } catch (error) {
    logger.error(`Evaluation failed for "${topic.title}":`, error.message);
    throw error;
  }
};

/**
 * Batch evaluate all discovered (unevaluated) topics
 * @returns {Promise<{evaluated: number, accepted: number, rejected: number}>}
 */
const evaluateDiscoveredTopics = async () => {
  const topics = await Topic.find({ status: 'discovered' }).sort({ createdAt: -1 }).limit(20);

  logger.info(`⚖️ Evaluating ${topics.length} discovered topics...`);

  let accepted = 0;
  let rejected = 0;

  for (const topic of topics) {
    try {
      const result = await evaluateTopic(topic);
      if (result.topic.status === 'accepted') accepted++;
      else rejected++;

      // Small delay between AI calls to avoid rate limiting
      await new Promise((r) => setTimeout(r, 500));
    } catch (error) {
      logger.error(`Skipping topic: ${topic.title}`);
    }
  }

  logger.info(`✅ Evaluation complete: ${accepted} accepted, ${rejected} rejected`);

  return { evaluated: topics.length, accepted, rejected };
};

module.exports = { evaluateTopic, evaluateDiscoveredTopics };
