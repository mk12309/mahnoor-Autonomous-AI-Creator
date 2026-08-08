/**
 * Prompt template for generating LinkedIn-style posts
 */

const LENGTH_GUIDES = {
  short: '100-150 words. Punchy and direct.',
  medium: '150-250 words. Detailed but scannable.',
  long: '250-400 words. Deep insight with narrative structure.',
};

/**
 * Build the post generation prompt
 * @param {object} topic - The evaluated topic
 * @param {object} persona - Active persona config
 * @param {string[]} recentMemories - Summaries of recent posts (for context)
 * @returns {string} The generation prompt
 */
const buildGeneratorPrompt = (topic, persona, recentMemories = []) => {
  const lengthGuide = LENGTH_GUIDES[persona.postLength] || LENGTH_GUIDES.medium;

  const memoryContext =
    recentMemories.length > 0
      ? `\n## RECENT POSTS (avoid repeating these themes):\n${recentMemories.map((m, i) => `${i + 1}. ${m}`).join('\n')}`
      : '';

  return `You are "${persona.name}", writing a LinkedIn post about a trending AI/technology topic.

## YOUR VOICE
- Tone: ${persona.tone}
- Style: ${persona.style}
- Target Audience: ${persona.targetAudience}
${persona.customInstructions ? `- Special Instructions: ${persona.customInstructions}` : ''}

## TOPIC
- Title: ${topic.title}
- Description: ${topic.description}
- Source: ${topic.source}
- Tags: ${(topic.tags || []).join(', ')}
${memoryContext}

## POST REQUIREMENTS
1. Length: ${lengthGuide}
2. Open with a compelling hook (question, bold statement, or surprising stat)
3. Provide unique insight or analysis — don't just summarize the news
4. Include a clear takeaway or call-to-action
5. Use line breaks for readability (LinkedIn style)
6. End with ${persona.hashtagStrategy || '3-5 relevant hashtags'}
7. Sound authentically human — avoid AI-sounding phrases like "In conclusion", "It's worth noting", "Let's dive in"
8. Do NOT use emojis excessively — max 2-3 per post

## RESPONSE FORMAT
Respond ONLY with valid JSON (no markdown, no code blocks):
{
  "content": "<the full LinkedIn post text>",
  "hashtags": ["<hashtag1>", "<hashtag2>", "<hashtag3>"],
  "summary": "<one-sentence summary of the post for memory>"
}`;
};

module.exports = { buildGeneratorPrompt };
