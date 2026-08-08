const app = require('./src/app');
const { connectDB } = require('./src/config/db');
const { env, validate } = require('./src/config/env');
const { initAI } = require('./src/config/ai');
const { initScheduler, startAll } = require('./src/jobs/scheduler');
const { runDiscoveryJob } = require('./src/jobs/discovery.job');
const { runPipelineJob } = require('./src/jobs/pipeline.job');
const { runCleanupJob } = require('./src/jobs/cleanup.job');
const logger = require('./src/utils/logger');

const startServer = async () => {
  try {
    // Validate environment
    const warnings = validate();
    warnings.forEach((w) => logger.warn(w));

    // Connect to MongoDB
    await connectDB();

    // Initialize AI providers
    initAI();

    // Initialize scheduled jobs
    initScheduler({
      discovery: runDiscoveryJob,
      pipeline: runPipelineJob,
      cleanup: runCleanupJob,
    });

    // Start the scheduler
    startAll();

    // Start HTTP server
    app.listen(env.PORT, () => {
      logger.info(`
╔══════════════════════════════════════════════╗
║          🔧 SignalForge AI Server            ║
║──────────────────────────────────────────────║
║  Status:    Running                          ║
║  Port:      ${String(env.PORT).padEnd(34)}║
║  Mode:      ${String(env.NODE_ENV).padEnd(34)}║
║  AI:        ${String(env.AI_PROVIDER).padEnd(34)}║
║  MongoDB:   Connected                        ║
║  Scheduler: Active                           ║
╚══════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

startServer();
