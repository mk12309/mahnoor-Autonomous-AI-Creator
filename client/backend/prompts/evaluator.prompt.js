/**
 * Evaluator Prompt Template
 * 
 * Responsibility:
 * Formats prompts for evaluating topic relevance using AI models.
 */

const buildEvaluatorPrompt = (topic, persona) => {
  return `Evaluate topic: ${topic.title}`;
};

module.exports = { buildEvaluatorPrompt };
