/**
 * HTTP Server Entry Point
 * 
 * Responsibility:
 * Initializes database connection, boots up HTTP server instance,
 * and automatically restores the Agent Cron Scheduler on startup if an active Agent exists.
 * 
 * The server ALWAYS starts even if the initial MongoDB connection fails —
 * the database module will fall back to localhost and retry automatically.
 */

const app = require('./app');
const config = require('./config/env');
const connectDB = require('./database/db');
const logger = require('./utils/logger');

const startServer = async () => {
  // 1. Start HTTP Server FIRST — so the port is claimed immediately
  const server = app.listen(config.port, () => {
    logger.info(`[Server] ⚡ SignalForge AI Backend running in ${config.nodeEnv} mode on port ${config.port}`);
    logger.info(`[Server] API ready at http://localhost:${config.port}`);
    logger.info(`[Server] Health check: http://localhost:${config.port}/health`);
    logger.info(`[Server] Agent feed: http://localhost:${config.port}/api/agent/feed`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      logger.error(`[Server] Port ${config.port} is already in use. Trying port ${config.port + 1}...`);
      app.listen(config.port + 1, () => {
        logger.info(`[Server] ⚡ SignalForge AI Backend running on fallback port ${config.port + 1}`);
      });
    } else {
      logger.error(`[Server] Startup error: ${err.message}`);
    }
  });

  // 2. Connect to MongoDB in background (non-blocking)
  try {
    await connectDB();
  } catch (err) {
    logger.error(`[Server] MongoDB connection failed: ${err.message}`);
    logger.warn('[Server] Server is still running with limited DB functionality.');
  }

  // 3. Check if an active Agent exists and restore Scheduler on server restart
  try {
    const PersonaConfig = require('./models/PersonaConfig');
    const { initCron } = require('./scheduler/cron');

    const activePersona = await PersonaConfig.findOne({ isActive: true });
    if (activePersona) {
      logger.info(`[Server] Restoring Autonomous Scheduler for active agent (${activePersona.name})...`);
      initCron();
    } else {
      logger.info('[Server] No active agent persona found yet. Awaiting POST /api/agent/init call.');
    }
  } catch (err) {
    logger.warn(`[Server] Could not restore agent state on startup: ${err.message}`);
  }
};

startServer();
