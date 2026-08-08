const dotenv = require('dotenv');
const path = require('path');

// Load .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

const env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // MongoDB
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/signalforge',

  // AI Providers
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  AI_PROVIDER: process.env.AI_PROVIDER || 'gemini',

  // LinkedIn
  LINKEDIN_ACCESS_TOKEN: process.env.LINKEDIN_ACCESS_TOKEN,
  LINKEDIN_PERSON_URN: process.env.LINKEDIN_PERSON_URN,

  // Pipeline
  DISCOVERY_CRON: process.env.DISCOVERY_CRON || '0 */4 * * *',
  PIPELINE_CRON: process.env.PIPELINE_CRON || '0 */6 * * *',
  RELEVANCE_THRESHOLD: parseInt(process.env.RELEVANCE_THRESHOLD) || 70,
  AUTO_APPROVE: process.env.AUTO_APPROVE === 'true',

  // RSS Feeds
  RSS_FEEDS: process.env.RSS_FEEDS
    ? process.env.RSS_FEEDS.split(',').map(url => url.trim())
    : [
        'https://hnrss.org/newest?q=AI',
        'https://techcrunch.com/feed/',
        'https://feeds.feedburner.com/TheHackersNews',
      ],
};

/**
 * Validate required environment variables
 */
const validate = () => {
  const warnings = [];

  if (!env.GEMINI_API_KEY && !env.OPENAI_API_KEY) {
    warnings.push('⚠️  No AI provider API key set. Set GEMINI_API_KEY or OPENAI_API_KEY.');
  }

  if (!env.LINKEDIN_ACCESS_TOKEN) {
    warnings.push('⚠️  LINKEDIN_ACCESS_TOKEN not set. Publishing will use mock mode.');
  }

  return warnings;
};

module.exports = { env, validate };
