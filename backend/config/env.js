/**
 * config/env.js
 * Centralized environment configuration loader.
 * NEVER expose secrets to the frontend.
 */

const dotenv = require('dotenv');
dotenv.config();

const publishMinutes = parseInt(process.env.PUBLISH_INTERVAL_MINUTES) || 30;

const computedCron = publishMinutes > 0 && publishMinutes < 60
  ? `*/${publishMinutes} * * * *`
  : '0 * * * *';

const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/signalforge_db',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  publishIntervalMinutes: publishMinutes,
  agentCronInterval: process.env.AGENT_CRON_INTERVAL || computedCron,
  relevanceThreshold: parseInt(process.env.RELEVANCE_THRESHOLD) || 70,

  // Breeth Persistent Memory Layer
  // Official docs: https://api.thebreeth.com — Write: POST /v1/episodes, Search: POST /v1/search
  breethApiKey: process.env.BREETH_API_KEY || '',
  breethBaseUrl: process.env.BREETH_BASE_URL || 'https://api.thebreeth.com',
};

module.exports = config;
