/**
 * Logger Utility
 * 
 * Responsibility:
 * Provides structured logging for server events, errors, and pipeline activity.
 */

const logger = {
  info: (msg) => console.log(`[INFO] ${msg}`),
  error: (msg) => console.error(`[ERROR] ${msg}`),
  warn: (msg) => console.warn(`[WARN] ${msg}`),
};

module.exports = logger;
