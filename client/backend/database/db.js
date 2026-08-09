/**
 * Database Connection Setup — Serverless-Compatible
 *
 * Caches the Mongoose connection across warm Vercel invocations.
 */

const mongoose = require('mongoose');
const config = require('../config/env');
const logger = require('../utils/logger');

let cached = { conn: null, promise: null };

const connectDB = async () => {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

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
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });

  try {
    cached.conn = await cached.promise;
    logger.info(`[Database] ✅ MongoDB Connected: ${cached.conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      logger.error(`[Database] Connection Error: ${err.message}`);
      cached = { conn: null, promise: null };
    });

    return cached.conn;
  } catch (error) {
    cached = { conn: null, promise: null };
    logger.error(`[Database] ❌ Connection failed: ${error.message}`);
    return null;
  }
};

module.exports = connectDB;
