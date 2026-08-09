/**
 * client/api/index.js — Vercel Serverless Entry Point for SignalForge AI Backend
 */

let connectDB;
let app;
let initError = null;

try {
  connectDB = require('../backend/database/db');
  app = require('../backend/app');
} catch (err) {
  initError = err;
  console.error('[Serverless Require Error]:', err.message);
}

let connectionPromise = null;

const ensureConnected = async () => {
  if (initError) throw initError;
  if (!connectDB) return;
  if (connectionPromise) return connectionPromise;
  connectionPromise = connectDB().catch((err) => {
    console.error('[Serverless DB Error]:', err.message);
    connectionPromise = null;
  });
  return connectionPromise;
};

module.exports = async (req, res) => {
  try {
    if (initError) {
      return res.status(500).json({
        error: 'Initialization Failed',
        message: initError.message,
        stack: initError.stack,
      });
    }

    await ensureConnected();
    return app(req, res);
  } catch (error) {
    return res.status(500).json({
      error: 'Serverless Function Exception',
      message: error.message,
      stack: error.stack,
    });
  }
};
