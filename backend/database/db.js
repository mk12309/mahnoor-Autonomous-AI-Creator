/**
 * Database Connection Setup
 * 
 * Responsibility:
 * Establishes and manages connection to MongoDB using Mongoose.
 * Features automatic failover and fallback strategy to ensure local development & demo
 * environment availability even when remote cluster IP access is restricted.
 */

const mongoose = require('mongoose');
const config = require('../config/env');
const logger = require('../utils/logger');

const connectDB = async (retries = 3, delayMs = 2000) => {
  const primaryUri = config.mongoUri;
  const fallbackUri = 'mongodb://127.0.0.1:27017/signalforge_db';

  // 1. Try Primary Configured URI
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      logger.info(`[Database] Connecting to MongoDB (Attempt ${attempt}/${retries})...`);
      const conn = await mongoose.connect(primaryUri, {
        serverSelectionTimeoutMS: 4000,
      });

      logger.info(`[Database] ✅ MongoDB Connected: ${conn.connection.host}`);

      mongoose.connection.on('error', (err) => {
        logger.error(`[Database] Connection Error: ${err.message}`);
      });

      return conn;
    } catch (error) {
      logger.warn(`[Database] Primary connection attempt ${attempt}/${retries} failed: ${error.message}`);
      if (attempt < retries) {
        await new Promise((res) => setTimeout(res, delayMs));
      }
    }
  }

  // 2. Fallback to Local MongoDB if Primary Atlas URI fails due to IP Whitelist / DNS block
  if (primaryUri !== fallbackUri) {
    try {
      logger.info(`[Database] 🔄 Falling back to local MongoDB instance (${fallbackUri})...`);
      const conn = await mongoose.connect(fallbackUri, {
        serverSelectionTimeoutMS: 3000,
      });
      logger.info(`[Database] ✅ Connected to Fallback MongoDB: ${conn.connection.host}`);
      return conn;
    } catch (fallbackError) {
      logger.error(`[Database] Fallback MongoDB connection also failed: ${fallbackError.message}`);
    }
  }

  logger.error('[Database] Unable to establish MongoDB connection. Check your database URI or IP Whitelist.');
};

module.exports = connectDB;
