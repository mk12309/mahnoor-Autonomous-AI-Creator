/**
 * Generator Prompt Template
 * 
 * Responsibility:
 * Formats prompts for post creation based on topic, persona voice, and historical context.
 */

const buildGeneratorPrompt = (topic, persona) => {
  return `Generate post for topic: ${topic.title}`;
};

module.exports = { buildGeneratorPrompt };
