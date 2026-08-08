const RSSParser = require('rss-parser');
const logger = require('./logger');

const parser = new RSSParser({
  timeout: 10000,
  headers: {
    'User-Agent': 'SignalForge-AI/1.0',
  },
});

/**
 * Parse an RSS feed URL and return normalized items
 * @param {string} feedUrl - RSS feed URL
 * @returns {Promise<Array>} Parsed feed items
 */
const parseFeed = async (feedUrl) => {
  try {
    const feed = await parser.parseURL(feedUrl);

    return (feed.items || []).map((item) => ({
      title: item.title || 'Untitled',
      description: item.contentSnippet || item.content || item.summary || '',
      sourceUrl: item.link || '',
      source: extractSourceName(feedUrl),
      publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
      categories: item.categories || [],
    }));
  } catch (error) {
    logger.error(`Failed to parse RSS feed: ${feedUrl}`, error.message);
    return [];
  }
};

/**
 * Parse multiple RSS feeds concurrently
 * @param {string[]} feedUrls - Array of feed URLs
 * @returns {Promise<Array>} All parsed items
 */
const parseMultipleFeeds = async (feedUrls) => {
  const results = await Promise.allSettled(feedUrls.map(parseFeed));

  return results
    .filter((r) => r.status === 'fulfilled')
    .flatMap((r) => r.value);
};

/**
 * Extract a friendly source name from the feed URL
 */
const extractSourceName = (url) => {
  try {
    const hostname = new URL(url).hostname;
    return hostname.replace('www.', '').split('.')[0];
  } catch {
    return 'unknown';
  }
};

module.exports = { parseFeed, parseMultipleFeeds };
