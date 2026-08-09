/**
 * Database Connection Setup — Serverless-Compatible
 *
 * Caches the Mongoose connection across warm Vercel invocations.
 * A new connection is only opened on cold start or after a failure.
 */

const mongoose = require('mongoose');
const config = require('../config/env');
const logger = require('../utils/logger');

// Module-level cache — survives across warm invocations on the same container
let cached = { conn: null, promise: null };

const connectDB = async () => {
  // Return existing live connection immediately
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // Reuse in-flight connection promise (prevents multiple parallel connects)
  if (cached.promise) {
    cached.conn = await cached.promise;
    return cached.conn;
  }

  const uri = config.mongoUri;
  if (!uri) {
    logger.error('[Database] MONGODB_URI is not set in environment variables.');
    return null;
  }

  logger.info('[Database] Opening new MongoDB Atlas connection...');

  cached.promise = mongoose.connect(uri, {
    serverSelectionTimeoutMS: 8000,
    socketTimeoutMS: 45000,
    // Required for serverless — do not buffer commands while connecting
    bufferCommands: false,
  });

  try {
    cached.conn = await cached.promise;
    logger.info(`[Database] ✅ MongoDB Connected: ${cached.conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      logger.error(`[Database] Connection Error: ${err.message}`);
      // Reset cache so next request reconnects
      cached = { conn: null, promise: null };
    });

    return cached.conn;
  } catch (error) {
    // Reset cache on failure so next request retries
    cached = { conn: null, promise: null };
    logger.error(`[Database] ❌ Connection failed: ${error.message}`);
    logger.error('[Database] Check MONGODB_URI env var and MongoDB Atlas → Network Access → allow 0.0.0.0/0');
    return null;
  }
};

module.exports = connectDB;
