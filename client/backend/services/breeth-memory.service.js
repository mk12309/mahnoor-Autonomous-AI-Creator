/**
 * services/breeth-memory.service.js
 *
 * OFFICIAL BREETH PERSISTENT MEMORY LAYER SERVICE
 *
 * Uses documented Breeth REST API (https://docs.thebreeth.com):
 *   WRITE:  POST https://api.thebreeth.com/v1/episodes
 *   SEARCH: POST https://api.thebreeth.com/v1/search
 *
 * Auth: Bearer ck_live_... (from BREETH_API_KEY in env)
 * Group: "signalforge"
 */

const axios = require('axios');
const config = require('../config/env');
const logger = require('../utils/logger');

const BREETH_BASE = 'https://api.thebreeth.com';
const BREETH_GROUP = 'signalforge';

const buildHeaders = () => ({
  'Authorization': `Bearer ${config.breethApiKey}`,
  'Content-Type': 'application/json',
});

const hasValidKey = () => {
  const key = config.breethApiKey;
  return key && key.startsWith('ck_live_') && key.length >= 8;
};

/**
 * writeEpisode(content)
 * POST https://api.thebreeth.com/v1/episodes
 */
const writeEpisode = async (content, extractIntent = true) => {
  try {
    if (!hasValidKey()) {
      logger.warn('[Breeth] BREETH_API_KEY is missing or invalid. Skipping write.');
      return null;
    }

    logger.info(`[BREETH] WRITE started for content length: ${content.length}`);
    const response = await axios.post(
      `${BREETH_BASE}/v1/episodes`,
      {
        content,
        group_id: BREETH_GROUP,
        source_description: 'signalforge-agent',
        extract_intent: extractIntent,
      },
      { headers: buildHeaders(), timeout: 3000 }
    );

    if (response.data && response.data.ok) {
      logger.info(`[BREETH] WRITE successful — episode: ${response.data.episode_name}`);
      return response.data;
    }
    return null;
  } catch (err) {
    logger.warn(`[BREETH] WRITE failed: ${err.message}`);
    return null;
  }
};

/**
 * searchMemory(query, limit)
 * POST https://api.thebreeth.com/v1/search
 */
const searchMemory = async (query, limit = 5) => {
  try {
    if (!hasValidKey()) {
      return [];
    }

    logger.info(`[BREETH] SEARCH started for query: "${query.substring(0, 50)}"`);
    const response = await axios.post(
      `${BREETH_BASE}/v1/search`,
      {
        query,
        group_id: BREETH_GROUP,
        limit,
      },
      { headers: buildHeaders(), timeout: 3000 }
    );

    const edges = response.data?.edges;
    if (!Array.isArray(edges)) {
      return [];
    }

    logger.info(`[BREETH] SEARCH returned ${edges.length} memories`);
    return edges;
  } catch (err) {
    logger.warn(`[BREETH] SEARCH warning: ${err.message}`);
    return [];
  }
};

const rememberPublishedPost = async ({ topic, score, rationale, postText, sources, timestamp }) => {
  const sourceList = (sources || []).map(s => s.url || s.title || '').filter(Boolean).join(', ');

  const content =
    `SignalForge AI published a new infrastructure brief.\n\n` +
    `Persona: SignalForge AI\n` +
    `Domain: AI Infrastructure / AI & Technology\n` +
    `Topic: ${topic}\n` +
    `Editorial Score: ${score}/100\n` +
    `Decision: PUBLISHED\n` +
    `Why Selected: ${rationale}\n` +
    `Sources: ${sourceList || 'N/A'}\n` +
    `Published Timestamp: ${timestamp || new Date().toISOString()}\n\n` +
    `Post:\n${postText}`;

  return writeEpisode(content, true);
};

const rememberRejectedTopic = async ({ topic, reason, score }) => {
  const content =
    `SignalForge AI rejected a discovered topic after editorial evaluation.\n\n` +
    `Persona: SignalForge AI\n` +
    `Domain: AI Infrastructure / AI & Technology\n` +
    `Topic: ${topic}\n` +
    `Decision: REJECTED\n` +
    `Rejection Reason: ${reason}\n` +
    `Editorial Score: ${score}/100\n` +
    `Timestamp: ${new Date().toISOString()}`;

  return writeEpisode(content, false);
};

const retrieveRecentContext = async (topicTitle) => {
  const query = `SignalForge AI previous editorial decisions and published posts about ${topicTitle}`;
  const edges = await searchMemory(query, 5);
  return edges.map(e => e.fact).filter(Boolean);
};

const healthCheck = async () => {
  try {
    if (!hasValidKey()) {
      return { connected: false, edgeCount: 0, error: 'BREETH_API_KEY missing or invalid' };
    }

    const response = await axios.post(
      `${BREETH_BASE}/v1/search`,
      { query: 'SignalForge AI infrastructure health probe', group_id: BREETH_GROUP, limit: 1 },
      { headers: buildHeaders(), timeout: 3000 }
    );
    const edges = response.data?.edges;
    return {
      connected: true,
      edgeCount: Array.isArray(edges) ? edges.length : 0,
      error: null,
    };
  } catch (err) {
    const status = err.response?.status;
    const msg = err.response?.data?.message || err.message;
    return { connected: false, edgeCount: 0, error: `HTTP ${status ?? 'N/A'}: ${msg}` };
  }
};

const writeMemory = async (content, extractIntent = true) => writeEpisode(content, extractIntent);
const retrieveRelevantContext = async (topicTitle) => retrieveRecentContext(topicTitle);

module.exports = {
  writeEpisode,
  writeMemory,
  searchMemory,
  rememberPublishedPost,
  rememberRejectedTopic,
  retrieveRecentContext,
  retrieveRelevantContext,
  healthCheck,
  hasValidKey,
};
