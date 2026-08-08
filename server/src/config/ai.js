const { GoogleGenerativeAI } = require('@google/generative-ai');
const OpenAI = require('openai');
const { env } = require('./env');
const logger = require('../utils/logger');

let geminiModel = null;
let openaiClient = null;

/**
 * Initialize AI providers based on environment config
 */
const initAI = () => {
  if (env.GEMINI_API_KEY) {
    const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    logger.info('✅ Gemini AI initialized');
  }

  if (env.OPENAI_API_KEY) {
    openaiClient = new OpenAI({ apiKey: env.OPENAI_API_KEY });
    logger.info('✅ OpenAI initialized');
  }

  if (!geminiModel && !openaiClient) {
    logger.warn('⚠️  No AI provider initialized. AI features will return mock data.');
  }
};

/**
 * Generate content using the configured AI provider
 * @param {string} prompt - The prompt to send
 * @param {object} options - Optional params (temperature, maxTokens, etc.)
 * @returns {Promise<{text: string, model: string, tokensUsed: number}>}
 */
const generateContent = async (prompt, options = {}) => {
  const provider = env.AI_PROVIDER;
  const temperature = options.temperature || 0.7;
  const maxTokens = options.maxTokens || 2048;

  try {
    // Try primary provider
    if (provider === 'gemini' && geminiModel) {
      const result = await geminiModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
        },
      });

      const response = result.response;
      const text = response.text();
      const usage = response.usageMetadata;

      return {
        text,
        model: 'gemini-2.0-flash',
        tokensUsed: usage ? usage.totalTokenCount : 0,
      };
    }

    if (provider === 'openai' && openaiClient) {
      const response = await openaiClient.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature,
        max_tokens: maxTokens,
      });

      return {
        text: response.choices[0].message.content,
        model: 'gpt-4o-mini',
        tokensUsed: response.usage ? response.usage.total_tokens : 0,
      };
    }

    // Fallback provider
    if (geminiModel) {
      const result = await geminiModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature, maxOutputTokens: maxTokens },
      });
      return {
        text: result.response.text(),
        model: 'gemini-2.0-flash',
        tokensUsed: 0,
      };
    }

    if (openaiClient) {
      const response = await openaiClient.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature,
        max_tokens: maxTokens,
      });
      return {
        text: response.choices[0].message.content,
        model: 'gpt-4o-mini',
        tokensUsed: response.usage ? response.usage.total_tokens : 0,
      };
    }

    // No provider available — return mock
    logger.warn('No AI provider available. Returning mock response.');
    return {
      text: `[MOCK AI RESPONSE] This is a placeholder. Configure GEMINI_API_KEY or OPENAI_API_KEY to enable real AI generation.\n\nPrompt received: "${prompt.substring(0, 100)}..."`,
      model: 'mock',
      tokensUsed: 0,
    };
  } catch (error) {
    logger.error(`AI generation error (${provider}):`, error.message);
    throw error;
  }
};

module.exports = { initAI, generateContent };
