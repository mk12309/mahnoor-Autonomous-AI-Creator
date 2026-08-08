/**
 * Persona voice and style definitions
 */

/**
 * Get the default persona configuration
 * @returns {object} Default persona settings
 */
const getDefaultPersona = () => ({
  name: 'AI Infrastructure Analyst',
  tone: 'professional',
  style: 'analytical',
  targetAudience: 'Tech professionals, CTOs, AI engineers, and startup founders',
  postLength: 'medium',
  hashtagStrategy: '3-5 relevant hashtags per post',
  avoidTopics: [],
  focusAreas: ['AI infrastructure', 'MLOps', 'LLMs', 'cloud computing', 'developer tools'],
  customInstructions: '',
  isActive: true,
});

/**
 * Persona preview prompt — for testing persona output
 */
const buildPreviewPrompt = (persona, sampleTopic = null) => {
  const topic = sampleTopic || {
    title: 'New Open-Source LLM Achieves GPT-4 Level Performance',
    description: 'A new open-source language model has been released that matches GPT-4 performance on key benchmarks while being significantly smaller and cheaper to run.',
  };

  return `You are "${persona.name}". Write a sample LinkedIn post to demonstrate your voice and style.

## YOUR VOICE
- Tone: ${persona.tone}
- Style: ${persona.style}
- Target Audience: ${persona.targetAudience}
${persona.customInstructions ? `- Special Instructions: ${persona.customInstructions}` : ''}

## SAMPLE TOPIC
- Title: ${topic.title}
- Description: ${topic.description}

Write a ${persona.postLength}-length LinkedIn post. Be authentic and engaging.

Respond ONLY with valid JSON:
{
  "content": "<the sample post>",
  "hashtags": ["<hashtag1>", "<hashtag2>", "<hashtag3>"]
}`;
};

module.exports = { getDefaultPersona, buildPreviewPrompt };
