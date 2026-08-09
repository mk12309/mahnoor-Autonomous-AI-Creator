/**
 * Database Connection Setup
 * 
 * Responsibility:
 * Establishes and manages connection to MongoDB Atlas using Mongoose.
 * Retries the primary URI up to 3 times before giving up.
 * The localhost fallback is intentionally removed — it does not exist in production.
 */

const mongoose = require('mongoose');
const config = require('../config/env');
const logger = require('../utils/logger');

const connectDB = async (retries = 3, delayMs = 2000) => {
  const primaryUri = config.mongoUri;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      logger.info(`[Database] Connecting to MongoDB (Attempt ${attempt}/${retries})...`);
      const conn = await mongoose.connect(primaryUri, {
        serverSelectionTimeoutMS: 8000,
      });

      logger.info(`[Database] ✅ MongoDB Connected: ${conn.connection.host}`);

      mongoose.connection.on('error', (err) => {
        logger.error(`[Database] Connection Error: ${err.message}`);
      });

      return conn;
    } catch (error) {
      logger.warn(`[Database] Connection attempt ${attempt}/${retries} failed: ${error.message}`);
      if (attempt < retries) {
        await new Promise((res) => setTimeout(res, delayMs));
      }
    }
  }

  logger.error('[Database] ❌ Unable to connect to MongoDB. Check MONGODB_URI and Atlas IP Whitelist (allow 0.0.0.0/0 for Render).');
  // Do NOT crash — let server.js handle gracefully
};

module.exports = connectDB;
