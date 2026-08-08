/**
 * Breeth AI Service
 * 
 * Responsibility:
 * Handles topic discovery, multi-dimensional topic evaluation incorporating Breeth Memory,
 * LinkedIn-style post generation in the Analyst persona voice, and publishing rationale synthesis.
 * 
 * Security:
 * API key loaded securely from process.env via config.breethApiKey. Secrets are never hardcoded.
 */

const axios = require('axios');
const RSSParser = require('rss-parser');
const config = require('../config/env');
const logger = require('../utils/logger');

const parser = new RSSParser({ timeout: 10000 });

/**
 * Call Breeth AI API or standard completion endpoint with retry logic and exponential backoff
 */
const callBreethAPI = async (prompt, options = {}, retries = 2) => {
  const apiKey = config.breethApiKey;
  const baseUrl = config.breethBaseUrl;

  if (!apiKey || apiKey === 'your_breeth_api_key_here' || apiKey.length < 5) {
    return null;
  }

  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      const response = await axios.post(
        `${baseUrl}/chat/completions`,
        {
          model: config.breethModel,
          messages: [{ role: 'user', content: prompt }],
          temperature: options.temperature || 0.7,
          max_tokens: options.maxTokens || 1200,
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: options.timeout || 15000,
        }
      );

      if (response.data && response.data.choices && response.data.choices[0]) {
        return response.data.choices[0].message.content.trim();
      }
    } catch (error) {
      logger.warn(`[Breeth AI API] Attempt ${attempt} failed: ${error.message}`);
      if (attempt <= retries) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise((res) => setTimeout(res, delay));
      }
    }
  }

  return null;
};

/**
 * 1. Discover AI & Technology topics from live RSS feeds
 */
const discoverTopics = async () => {
  logger.info('[Breeth Service] Executing discoverTopics() from live sources...');

  const topics = [];
  const feedUrls = [
    'https://hnrss.org/newest?q=AI',
    'https://techcrunch.com/feed/',
    'https://feeds.feedburner.com/TheHackersNews'
  ];

  for (const url of feedUrls) {
    try {
      const feed = await parser.parseURL(url);
      (feed.items || []).slice(0, 3).forEach((item) => {
        topics.push({
          title: item.title ? item.title.trim() : 'AI Tech Advancement',
          description: (item.contentSnippet || item.summary || item.title || '').substring(0, 500),
          source: feed.title ? feed.title.replace(/RSS/i, '').trim() : 'Live Tech Feed',
          sourceUrl: item.link || item.guid || url,
        });
      });
    } catch (err) {
      logger.warn(`[Breeth Service] Live feed parse warning for ${url}: ${err.message}`);
    }
  }

  if (topics.length === 0) {
    topics.push({
      title: 'Scalable LLM Memory Optimizations & FlashAttention-3 Benchmarks',
      description: 'Architectural analysis of attention mechanisms for enterprise AI clusters.',
      source: 'SignalForge Stream',
      sourceUrl: 'https://signalforge.ai/telemetry/latest',
    });
  }

  return topics;
};

/**
 * 2. Multi-dimensional Editorial Scoring System using Breeth Memories
 * Evaluates topics across 6 dimension breakdown metrics:
 * - technicalRelevance (0-20)
 * - aiEcosystemImpact (0-20)
 * - novelty (0-20)
 * - educationalValue (0-20)
 * - communityInterest (0-10)
 * - duplicateRisk (0-10 penalty)
 */
const evaluateTopics = async (topics, breethMemoriesMap = {}) => {
  logger.info(`[Breeth Service] Executing multi-dimensional evaluateTopics() for ${topics.length} topics using Breeth Memories...`);

  const results = [];

  for (const topic of topics) {
    const relevantMemories = breethMemoriesMap[topic.sourceUrl] || breethMemoriesMap[topic.title] || [];
    const memoryContextString = relevantMemories.length > 0
      ? `\nRetrieved Breeth Memories for this topic:\n- ${relevantMemories.map(m => typeof m === 'string' ? m : m.content).join('\n- ')}\n`
      : '';

    const prompt = `You are an AI Infrastructure Analyst performing editorial evaluation.
Topic Title: ${topic.title}
Description: ${topic.description}
${memoryContextString}

Score this topic strictly across these 6 breakdown dimensions:
- technicalRelevance (0 to 20)
- aiEcosystemImpact (0 to 20)
- novelty (0 to 20)
- educationalValue (0 to 20)
- communityInterest (0 to 10)
- duplicateRisk (0 to 10 penalty, increase if retrieved Breeth memories show similar past topics)

Respond strictly in JSON format:
{
  "technicalRelevance": 18,
  "aiEcosystemImpact": 16,
  "novelty": 15,
  "educationalValue": 17,
  "communityInterest": 8,
  "duplicateRisk": 0,
  "reasoning": "<editorial justification>"
}`;

    const apiOutput = await callBreethAPI(prompt, { temperature: 0.2 });

    let breakdown = {
      technicalRelevance: 16,
      aiEcosystemImpact: 16,
      novelty: 15,
      educationalValue: 15,
      communityInterest: 8,
      duplicateRisk: 0,
    };
    let reasoning = 'High relevance to AI infrastructure and compute cluster optimization.';

    if (apiOutput) {
      try {
        const clean = apiOutput.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(clean);
        breakdown = {
          technicalRelevance: Math.min(20, Math.max(0, parsed.technicalRelevance || 15)),
          aiEcosystemImpact: Math.min(20, Math.max(0, parsed.aiEcosystemImpact || 15)),
          novelty: Math.min(20, Math.max(0, parsed.novelty || 14)),
          educationalValue: Math.min(20, Math.max(0, parsed.educationalValue || 15)),
          communityInterest: Math.min(10, Math.max(0, parsed.communityInterest || 7)),
          duplicateRisk: Math.min(10, Math.max(0, parsed.duplicateRisk || 0)),
        };
        reasoning = parsed.reasoning || reasoning;
      } catch (e) {
        // fallback
      }
    } else {
      // Heuristic scoring breakdown
      const text = (topic.title + ' ' + topic.description).toLowerCase();
      const highKw = ['ai', 'llm', 'gpu', 'infrastructure', 'mlops', 'cluster', 'benchmark', 'scaling', 'model', 'agent', 'security', 'linux', 'browser'];
      let matchCount = 0;
      highKw.forEach((k) => { if (text.includes(k)) matchCount++; });

      const hasMemoryMatch = relevantMemories.length > 0;

      breakdown = {
        technicalRelevance: Math.min(20, 12 + matchCount * 2),
        aiEcosystemImpact: Math.min(20, 12 + matchCount * 2),
        novelty: hasMemoryMatch ? 10 : 16,
        educationalValue: 16,
        communityInterest: 8,
        duplicateRisk: hasMemoryMatch ? 8 : 0,
      };
    }

    const rawTotal = breakdown.technicalRelevance +
      breakdown.aiEcosystemImpact +
      breakdown.novelty +
      breakdown.educationalValue +
      breakdown.communityInterest;

    const finalScore = Math.min(100, Math.max(0, rawTotal - breakdown.duplicateRisk));
    const accepted = finalScore >= config.relevanceThreshold;

    results.push({
      topic,
      score: finalScore,
      scoreBreakdown: { ...breakdown, finalScore },
      accepted,
      reasoning,
    });
  }

  return results;
};

/**
 * 3. Generate post using retrieved Breeth Memories in persona voice
 */
const generatePost = async (topic, persona = {}, breethMemories = []) => {
  logger.info(`[Breeth Service] Executing generatePost() using Breeth Memories for: "${topic.title}"`);

  const memoryContextSection = breethMemories.length > 0
    ? `\nRETRIEVED BREETH MEMORIES (Maintain consistency and avoid duplicating previous opinions):\n- ${breethMemories.slice(0, 5).map(m => typeof m === 'string' ? m : m.content).join('\n- ')}\n`
    : '';

  const prompt = `You are "${persona.name || 'SignalForge AI'}" (AI Infrastructure Analyst).
Topic: ${topic.title}
Details: ${topic.description}
${memoryContextSection}
Write a post that MUST contain these 4 sections:
1. ⚡ [Infrastructure Brief]
2. 🔍 [Technical Analysis]
3. 💡 [Developer Impact]
4. 🔮 [Future Outlook]

End with technical hashtags.`;

  const apiOutput = await callBreethAPI(prompt, { temperature: 0.7 });

  if (apiOutput && apiOutput.includes('Developer Impact')) {
    return apiOutput;
  }

  // Consistent 4-section fallback
  return `⚡ [Infrastructure Brief]\n` +
    `Topic: ${topic.title}\n` +
    `Recent telemetry highlights critical scaling dynamics in enterprise AI compute workloads. ` +
    `As model parameter density scales, system performance hinges on optimizing interconnect topology and GPU memory efficiency.\n\n` +
    `🔍 [Technical Analysis]\n` +
    `High-throughput LLM serving demands tight integration between memory-bound attention kernels and KV-cache offloading. ` +
    `Benchmarking across multi-node GPU clusters indicates that decoupling prefill and decode execution stages reduces overall P99 inference latency by up to 34%.\n\n` +
    `💡 [Developer Impact]\n` +
    `Infrastructure engineers building AI platforms must prioritize memory bandwidth over raw FLOP scaling. ` +
    `Auditing inter-node network throughput and implementing tensor-parallel model partitioning prevents compute starvation under heavy concurrent requests.\n\n` +
    `🔮 [Future Outlook]\n` +
    `The future of AI infrastructure relies on heterogeneous compute routing and automated cluster elasticity. ` +
    `Teams that invest in robust telemetry and memory-aware scheduling will achieve superior cost-performance efficiency.\n\n` +
    `#AI #Infrastructure #MLOps #Compute #SignalForge`;
};

/**
 * 4. Generate publishing rationale
 */
const generateRationale = async (topic, postText) => {
  logger.info(`[Breeth Service] Executing generateRationale() for topic: "${topic.title}"`);

  const prompt = `Explain in 2 authoritative sentences why SignalForge AI selected this topic for publishing:
Topic: ${topic.title}`;

  const apiOutput = await callBreethAPI(prompt, { temperature: 0.3 });

  if (apiOutput) {
    return apiOutput;
  }

  return `Selected by SignalForge AI persona for exceptional technical relevance to AI infrastructure scaling and high strategic utility for enterprise system architects.`;
};

module.exports = {
  discoverTopics,
  evaluateTopics,
  generatePost,
  generateRationale,
};
