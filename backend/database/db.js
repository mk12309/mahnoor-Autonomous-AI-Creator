/**
 * Database Connection Setup — Serverless-Compatible
 */

const mongoose = require('mongoose');
const config = require('../config/env');
const logger = require('../utils/logger');

let cached = { conn: null, promise: null };

const connectDB = async () => {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  const uri = config.mongoUri;
  if (!uri || uri.includes('your_mongodb_atlas_connection_string')) {
    const msg = '[Database] MONGODB_URI is not configured in Vercel environment variables.';
    logger.error(msg);
    throw new Error(msg);
  }

  if (cached.promise) {
    try {
      cached.conn = await cached.promise;
      return cached.conn;
    } catch (e) {
      cached = { conn: null, promise: null };
      throw e;
    }
  }

  logger.info('[Database] Connecting to MongoDB Atlas...');

  cached.promise = mongoose.connect(uri, {
    serverSelectionTimeoutMS: 8000,
    socketTimeoutMS: 45000,
  });

  try {
    cached.conn = await cached.promise;
    logger.info(`[Database] ✅ MongoDB Connected: ${cached.conn.connection.host}`);
    return cached.conn;
  } catch (error) {
    cached = { conn: null, promise: null };
    logger.error(`[Database] ❌ Connection failed: ${error.message}`);
    throw new Error(`MongoDB Connection Failed: ${error.message}`);
  }
};

module.exports = connectDB;
