/**
 * Breeth Memory Layer Service
 * 
 * Responsibility:
 * Interfaces with Breeth AI persistent, intent-aware memory REST API.
 * Provides functions for:
 * 1. writeEpisode(episodeData) -> Writes a published post episode to Breeth Memory Layer
 * 2. writeRejectionMemory(topicTitle, reason) -> Writes a rejected editorial decision to Breeth Memory Layer
 * 3. searchMemories(query, limit) -> Searches intent-aware memories from Breeth Memory Layer
 */

const axios = require('axios');
const config = require('../config/env');
const logger = require('../utils/logger');
const memoryService = require('./memory.service');

// Local memory buffer as fallback when Breeth API key is placeholder or unreachable
const localBreethMemoryStore = [];

/**
 * Write a published episode memory to Breeth Memory API
 * Endpoint: POST /v1/memories (or fallback local buffer + MongoDB Memory)
 */
const writeEpisode = async (episodeData) => {
  const { topic, text, rationale, source, timestamp } = episodeData;

  logger.info(`[Breeth Memory] Writing published episode to Breeth Memory: "${topic}"`);

  const memoryPayload = {
    content: `Published Brief: ${topic}\n\nRationale: ${rationale}\n\nContent Excerpt: ${text.substring(0, 300)}...`,
    metadata: {
      type: 'published_episode',
      topicTitle: topic,
      rationale: rationale,
      sourceUrl: source ? source.url : '',
      sourceName: source ? source.title : '',
      timestamp: timestamp || new Date().toISOString(),
    },
  };

  const apiKey = config.breethApiKey;
  const baseUrl = config.breethBaseUrl;

  if (apiKey && apiKey !== 'your_breeth_api_key_here' && apiKey.length > 5) {
    try {
      const response = await axios.post(
        `${baseUrl}/memories`,
        memoryPayload,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 8000,
        }
      );
      logger.info(`[Breeth Memory API] ✅ Episode written to Breeth Memory endpoint (ID: ${response.data.id || 'ok'})`);
      return response.data;
    } catch (error) {
      logger.warn(`[Breeth Memory API] Write request warning (${error.message}). Saved to fallback memory store.`);
    }
  }

  // Backup write to local Breeth memory buffer & MongoDB memory collection
  localBreethMemoryStore.push(memoryPayload);
  await memoryService.recordPublishedTopic(topic, rationale);
  return { status: 'saved_locally', payload: memoryPayload };
};

/**
 * Write a rejected editorial decision memory to Breeth Memory API
 * Endpoint: POST /v1/memories
 */
const writeRejectionMemory = async (topicTitle, reason) => {
  logger.info(`[Breeth Memory] Writing rejected topic decision to Breeth Memory: "${topicTitle}"`);

  const memoryPayload = {
    content: `Rejected Topic: ${topicTitle}\nRejection Reason: ${reason}`,
    metadata: {
      type: 'rejected_decision',
      topicTitle,
      reason,
      timestamp: new Date().toISOString(),
    },
  };

  const apiKey = config.breethApiKey;
  const baseUrl = config.breethBaseUrl;

  if (apiKey && apiKey !== 'your_breeth_api_key_here' && apiKey.length > 5) {
    try {
      await axios.post(
        `${baseUrl}/memories`,
        memoryPayload,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 5000,
        }
      );
      logger.info(`[Breeth Memory API] ✅ Rejection decision written to Breeth Memory`);
    } catch (error) {
      // Local fallback write
    }
  }

  localBreethMemoryStore.push(memoryPayload);
  await memoryService.recordRejectedTopic(topicTitle, reason);
};

/**
 * Search intent-aware memories from Breeth Memory API
 * Endpoint: POST /v1/memories/search (or GET /v1/memories/search?query=)
 */
const searchMemories = async (query, limit = 5) => {
  logger.info(`[Breeth Memory] Searching Breeth Memory Layer for query: "${query.substring(0, 40)}..."`);

  const apiKey = config.breethApiKey;
  const baseUrl = config.breethBaseUrl;

  if (apiKey && apiKey !== 'your_breeth_api_key_here' && apiKey.length > 5) {
    try {
      const response = await axios.post(
        `${baseUrl}/memories/search`,
        { query, limit },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 8000,
        }
      );

      if (response.data && Array.isArray(response.data.memories)) {
        logger.info(`[Breeth Memory API] Found ${response.data.memories.length} relevant memories in Breeth`);
        return response.data.memories;
      }
    } catch (error) {
      logger.warn(`[Breeth Memory API] Search request warning (${error.message}). Using fallback memory search.`);
    }
  }

  // Fallback intent search across local memory store & MongoDB memory
  const normalizedQuery = query.toLowerCase();
  const matched = localBreethMemoryStore.filter((m) => {
    const text = (m.content + ' ' + (m.metadata.topicTitle || '')).toLowerCase();
    return text.includes(normalizedQuery) || normalizedQuery.includes(m.metadata.topicTitle?.toLowerCase() || 'xyz');
  });

  const recentMongoTopics = await memoryService.getRecentPublishedTopics(limit);
  
  const formattedFallback = matched.map((m) => m.content).concat(
    recentMongoTopics.map((t) => `Previous Published Topic: ${t}`)
  );

  return formattedFallback.slice(0, limit);
};

module.exports = {
  writeEpisode,
  writeRejectionMemory,
  searchMemories,
};
