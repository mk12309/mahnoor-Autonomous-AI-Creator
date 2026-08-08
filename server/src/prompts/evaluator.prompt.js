/**
 * Prompt template for evaluating topic relevance
 */

/**
 * Build the topic evaluation prompt
 * @param {object} topic - The topic to evaluate
 * @param {object} persona - Active persona config
 * @returns {string} The evaluation prompt
 */
const buildEvaluatorPrompt = (topic, persona) => {
  return `You are an AI content strategist evaluating whether a topic is worth creating a LinkedIn post about.

## PERSONA CONTEXT
- Name: ${persona.name}
- Focus Areas: ${persona.focusAreas.join(', ')}
- Target Audience: ${persona.targetAudience}
- Topics to Avoid: ${persona.avoidTopics.length > 0 ? persona.avoidTopics.join(', ') : 'None specified'}

## TOPIC TO EVALUATE
- Title: ${topic.title}
- Description: ${topic.description}
- Source: ${topic.source}

## EVALUATION CRITERIA
Score the topic from 0-100 based on:
1. **Relevance** (0-25): How relevant is this to the persona's focus areas?
2. **Timeliness** (0-25): Is this current and newsworthy?
3. **Engagement Potential** (0-25): Would this spark discussion on LinkedIn?
4. **Uniqueness** (0-25): Is this a fresh angle or common knowledge?

## RESPONSE FORMAT
Respond ONLY with valid JSON (no markdown, no code blocks):
{
  "score": <number 0-100>,
  "reasoning": "<brief explanation>",
  "tags": ["<relevant>", "<tags>"],
  "category": "<one of: breakthrough, trend, opinion, tutorial, news>"
}`;
};

module.exports = { buildEvaluatorPrompt };
