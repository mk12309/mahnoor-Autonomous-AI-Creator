/**
 * api/index.js — Vercel Serverless Entry Point for SignalForge AI Backend
 *
 * This file exports the Express app as a Vercel serverless function.
 * - app.listen() is NOT called here (Vercel manages the HTTP server)
 * - MongoDB connection is established per cold-start and cached across warm invocations
 * - node-cron scheduler is replaced by Vercel Cron (configured in vercel.json)
 */

const connectDB = require('../backend/database/db');
const app = require('../backend/app');

// Connection promise — cached across warm Vercel invocations
let connectionPromise = null;

const ensureConnected = () => {
  if (connectionPromise) return connectionPromise;
  connectionPromise = connectDB().catch((err) => {
    console.error('[Serverless] DB connection failed:', err.message);
    connectionPromise = null; // allow retry on next request
  });
  return connectionPromise;
};

// Export handler — Vercel calls this for every request
module.exports = async (req, res) => {
  await ensureConnected();
  app(req, res);
};
