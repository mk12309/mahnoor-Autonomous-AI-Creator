/**
 * services/breeth-memory.service.js
 *
 * OFFICIAL BREETH PERSISTENT MEMORY LAYER SERVICE
 *
 * Uses the documented Breeth REST API (https://docs.thebreeth.com):
 *
 *   WRITE:  POST https://api.thebreeth.com/v1/episodes
 *           Body: { content, group_id, extract_intent }
 *           Response: { ok, episode_name, extracted: { entities, edges } }
 *
 *   SEARCH: POST https://api.thebreeth.com/v1/search
 *           Body: { query, group_id, limit }
 *           Response: { edges: [{ fact, source_node, target_node, name, intent_meta }] }
 *
 * Auth: Bearer ck_live_... (from BREETH_API_KEY in .env — never hardcoded)
 * Group: "signalforge" (consistent identifier for all SignalForge memories)
 *
 * Security:
 * - API key loaded from process.env via config.breethApiKey
 * - Key is NEVER logged, never returned in API responses, never sent to frontend
 */

const axios = require('axios');
const config = require('../config/env');
const logger = require('../utils/logger');

const BREETH_BASE = 'https://api.thebreeth.com';
const BREETH_GROUP = 'signalforge';

/**
 * Build Axios headers — key is sourced from env only, never logged.
 */
const buildHeaders = () => ({
  'Authorization': `Bearer ${config.breethApiKey}`,
  'Content-Type': 'application/json',
});

/**
 * Verify the API key is a real Breeth key (not a placeholder).
 * Official keys start with ck_live_ — minimum length check uses >= 8 chars
 * after the prefix to allow for shorter keys during development.
 */
const hasValidKey = () => {
  const key = config.breethApiKey;
  return key && key.startsWith('ck_live_') && key.length >= 8;
};

/**
 * writeEpisode(content)
 *
 * Writes a prose episode to Breeth persistent memory.
 * Endpoint: POST /v1/episodes
 * Returns { ok, episode_name, extracted } on success, or null on failure.
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
      { headers: buildHeaders(), timeout: 10000 }
    );

    if (response.data && response.data.ok) {
      logger.info(
        `[BREETH] WRITE successful — episode: ${response.data.episode_name}, ` +
        `entities: ${response.data.extracted?.entities ?? 0}, edges: ${response.data.extracted?.edges ?? 0}`
      );
      return response.data;
    }

    logger.warn(`[BREETH] WRITE failed: response not ok ${JSON.stringify(response.data)}`);
    return null;
  } catch (err) {
    const status = err.response?.status;
    const msg = err.response?.data?.message || err.message;
    logger.error(`[BREETH] WRITE failed (HTTP ${status ?? 'N/A'}): ${msg}`);
    return null;
  }
};

/**
 * searchMemory(query, limit)
 *
 * Searches Breeth persistent memory with hybrid BM25 + vector + graph retrieval.
 * Endpoint: POST /v1/search
 * Returns an array of fact strings extracted from edges[].fact
 */
const searchMemory = async (query, limit = 5) => {
  try {
    if (!hasValidKey()) {
      logger.warn('[Breeth] BREETH_API_KEY is missing or invalid. Skipping search.');
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
      { headers: buildHeaders(), timeout: 10000 }
    );

    const edges = response.data?.edges;
    if (!Array.isArray(edges)) {
      if (response.data && Object.keys(response.data).length > 0) {
        logger.warn(`[BREETH] SEARCH returned unexpected shape: ${JSON.stringify(response.data).substring(0, 200)}`);
      }
      return [];
    }

    logger.info(`[BREETH] SEARCH returned ${edges.length} memories`);
    return edges;
  } catch (err) {
    const status = err.response?.status;
    const msg = err.response?.data?.message || err.message;
    logger.error(`[BREETH] SEARCH failed (HTTP ${status ?? 'N/A'}): ${msg}`);
    return [];
  }
};

/**
 * rememberPublishedPost(postData)
 *
 * Writes a published post episode to Breeth Memory.
 * Called after a post is saved to MongoDB.
 */
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

/**
 * rememberRejectedTopic(rejectionData)
 *
 * Writes a rejected topic editorial decision to Breeth Memory.
 */
const rememberRejectedTopic = async ({
  topic, reason, score,
  technicalRelevance, aiEcosystemImpact, novelty,
  educationalValue, communityInterest, duplicateRisk,
}) => {
  const content =
    `SignalForge AI rejected a discovered topic after editorial evaluation.\n\n` +
    `Persona: SignalForge AI\n` +
    `Domain: AI Infrastructure / AI & Technology\n` +
    `Topic: ${topic}\n` +
    `Decision: REJECTED\n` +
    `Rejection Reason: ${reason}\n` +
    `Editorial Score: ${score}/100\n` +
    `Score Breakdown:\n` +
    `  - Technical Relevance: ${technicalRelevance ?? 'N/A'}/20\n` +
    `  - AI Ecosystem Impact: ${aiEcosystemImpact ?? 'N/A'}/20\n` +
    `  - Novelty: ${novelty ?? 'N/A'}/20\n` +
    `  - Educational Value: ${educationalValue ?? 'N/A'}/20\n` +
    `  - Community Interest: ${communityInterest ?? 'N/A'}/10\n` +
    `  - Duplicate Risk Penalty: ${duplicateRisk ?? 0}/10\n` +
    `Timestamp: ${new Date().toISOString()}`;

  return writeEpisode(content, false);
};

/**
 * retrieveRecentContext(topicTitle)
 *
 * Searches Breeth for previously published posts and editorial decisions
 * related to a specific topic. Returns fact strings for editorial use.
 */
const retrieveRecentContext = async (topicTitle) => {
  const query = `SignalForge AI previous editorial decisions and published posts about ${topicTitle}`;
  const edges = await searchMemory(query, 8);

  // Convert edges to fact strings for use in editorial evaluation
  return edges.map(e => e.fact).filter(Boolean);
};

/**
 * healthCheck()
 *
 * Performs a real Breeth API search WITHOUT swallowing auth errors.
 * Uses a direct axios call (not searchMemory) so that 401/403 are thrown.
 * Returns { connected: bool, edgeCount: number, error: string|null }
 */
const healthCheck = async () => {
  try {
    if (!hasValidKey()) {
      return { connected: false, edgeCount: 0, error: 'BREETH_API_KEY missing or invalid' };
    }

    const response = await axios.post(
      `${BREETH_BASE}/v1/search`,
      { query: 'SignalForge AI infrastructure health probe', group_id: BREETH_GROUP, limit: 1 },
      { headers: buildHeaders(), timeout: 8000 }
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
    const errorStr = `HTTP ${status ?? 'N/A'}: ${msg}`;
    logger.warn(`[Breeth] healthCheck failed — ${errorStr}`);
    return { connected: false, edgeCount: 0, error: errorStr };
  }
};

/**
 * writeMemory(content, extractIntent)
 * Alias / wrapper for writeEpisode to match exact spec signature.
 */
const writeMemory = async (content, extractIntent = true) => {
  return writeEpisode(content, extractIntent);
};

/**
 * retrieveRelevantContext(topicTitle)
 * Searches Breeth for previous decisions and opinions related to topic.
 */
const retrieveRelevantContext = async (topicTitle) => {
  return retrieveRecentContext(topicTitle);
};

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
