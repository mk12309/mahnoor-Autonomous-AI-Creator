/**
 * controllers/debug.controller.js
 *
 * Development-only debug controller for verifying Breeth integration.
 * Performs a REAL Breeth WRITE then a REAL Breeth READ using direct Axios calls
 * (not the wrapped service functions) so that auth errors like 401 are visibly reported.
 *
 * Never exposes the API key or Authorization header in the response.
 * Disabled in production (returns 403).
 */

const axios = require('axios');
const breethMemory = require('../services/breeth-memory.service');
const logger = require('../utils/logger');
const config = require('../config/env');

const BREETH_BASE = 'https://api.thebreeth.com';
const BREETH_GROUP = 'signalforge';

/**
 * GET /api/debug/breeth
 *
 * Performs:
 *   1. Real Breeth WRITE (POST /v1/episodes)
 *   2. Real Breeth READ (POST /v1/search) — direct axios, so 401 errors are reported
 *
 * Returns JSON (never includes API key):
 *   { breeth, keyPresent, keyPrefix, write, writeEpisodeName, read, readCount, error }
 */
const testBreeth = async (req, res, next) => {
  // Block in production
  if (config.nodeEnv === 'production') {
    return res.status(403).json({
      error: 'Debug endpoint disabled in production',
    });
  }

  logger.info('[Debug] /api/debug/breeth — starting real Breeth write + read test...');

  const keyValid = breethMemory.hasValidKey();
  const result = {
    breeth: 'disconnected',
    keyPresent: keyValid,
    // Show only first 10 chars of key prefix for debugging — never the full key
    keyPrefix: keyValid ? (config.breethApiKey || '').substring(0, 10) + '...' : 'missing/invalid',
    write: false,
    writeEpisodeName: null,
    read: false,
    readCount: 0,
    error: null,
  };

  if (!keyValid) {
    result.error = 'BREETH_API_KEY is missing or does not start with ck_live_. Check backend/.env';
    logger.warn('[Debug] Breeth key not valid. Cannot test.');
    return res.status(200).json(result);
  }

  // Build headers — key is NEVER returned in the response
  const headers = {
    'Authorization': `Bearer ${config.breethApiKey}`,
    'Content-Type': 'application/json',
  };

  // ─── Step 1: Real WRITE ────────────────────────────────────────────────────
  try {
    const testContent =
      `SignalForge AI debug test memory write.\n` +
      `Persona: SignalForge AI\n` +
      `Domain: AI Infrastructure / AI & Technology\n` +
      `Topic: Debug connectivity test\n` +
      `Decision: DEBUG_TEST\n` +
      `Timestamp: ${new Date().toISOString()}\n` +
      `This entry was written by the /api/debug/breeth endpoint to verify Breeth connectivity.`;

    const writeResp = await axios.post(
      `${BREETH_BASE}/v1/episodes`,
      {
        content: testContent,
        group_id: BREETH_GROUP,
        source_description: 'signalforge-debug',
        extract_intent: false,
      },
      { headers, timeout: 12000 }
    );

    if (writeResp.data && writeResp.data.ok) {
      result.write = true;
      result.writeEpisodeName = writeResp.data.episode_name || 'unknown';
      logger.info(`[Debug] ✅ Breeth WRITE confirmed. Episode: ${result.writeEpisodeName}`);
    } else {
      result.error = `Write did not return ok:true. Body: ${JSON.stringify(writeResp.data).substring(0, 200)}`;
      logger.warn(`[Debug] ⚠️ Breeth write not confirmed: ${result.error}`);
    }
  } catch (err) {
    const status = err.response?.status;
    const msg = err.response?.data?.message || err.message;
    result.error = `WRITE failed HTTP ${status ?? 'N/A'}: ${msg}`;
    logger.error(`[Debug] ❌ Breeth WRITE failed: ${result.error}`);
  }

  // ─── Step 2: Real READ ─────────────────────────────────────────────────────
  // Using direct axios (not the searchMemory wrapper) so 401 errors surface here
  try {
    const readResp = await axios.post(
      `${BREETH_BASE}/v1/search`,
      { query: 'SignalForge AI infrastructure debug test', group_id: BREETH_GROUP, limit: 5 },
      { headers, timeout: 12000 }
    );

    const edges = readResp.data?.edges;
    if (Array.isArray(edges)) {
      result.read = true;
      result.readCount = edges.length;
      logger.info(`[Debug] ✅ Breeth READ confirmed. Edges returned: ${result.readCount}`);
    } else {
      const readErr = `Read returned unexpected shape: ${JSON.stringify(readResp.data).substring(0, 100)}`;
      result.error = (result.error ? result.error + ' | ' : '') + readErr;
      logger.warn(`[Debug] ⚠️ ${readErr}`);
    }
  } catch (err) {
    const status = err.response?.status;
    const msg = err.response?.data?.message || err.message;
    const readErr = `READ failed HTTP ${status ?? 'N/A'}: ${msg}`;
    result.error = (result.error ? result.error + ' | ' : '') + readErr;
    logger.error(`[Debug] ❌ Breeth READ failed: ${readErr}`);
  }

  const responsePayload = {
    breeth: (result.write && result.read) ? 'connected' : 'disconnected',
    write: {
      success: result.write,
      episode_name: result.writeEpisodeName
    },
    read: {
      success: result.read,
      results: result.readCount
    },
    error: result.error
  };

  return res.status(200).json(responsePayload);
};

module.exports = { testBreeth };
