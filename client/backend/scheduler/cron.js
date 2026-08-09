/**
 * Agent Scheduler (node-cron)
 * 
 * Responsibility:
 * Runs the autonomous agent engine on an automated periodic interval using node-cron.
 * Configured via PUBLISH_INTERVAL_MINUTES or AGENT_CRON_INTERVAL in .env.
 */

const cron = require('node-cron');
const config = require('../config/env');
const { runAgentCycle } = require('../services/agent.service');
const logger = require('../utils/logger');

let cronJob = null;
let lastExecutionTime = null;

/**
 * Initialize and start the Agent Cron Scheduler
 */
const initCron = () => {
  if (cronJob) {
    logger.info('[Scheduler] Cron Scheduler is already running.');
    return cronJob;
  }

  const interval = config.agentCronInterval;

  logger.info(`[Scheduler] Initializing Agent Cron Scheduler with interval: ${config.publishIntervalMinutes}m ("${interval}")`);

  const validInterval = cron.validate(interval) ? interval : '*/30 * * * *';

  cronJob = cron.schedule(validInterval, async () => {
    lastExecutionTime = new Date();
    logger.info(`[Scheduler] ⏰ Cron Triggered at ${lastExecutionTime.toISOString()}`);
    try {
      await runAgentCycle();
    } catch (err) {
      logger.error(`[Scheduler] Error during scheduled agent execution: ${err.message}`);
    }
  });

  logger.info('[Scheduler] ✅ Autonomous Agent Cron Scheduler active.');
  return cronJob;
};

/**
 * Calculate estimated next scheduled run timestamp
 */
const getNextScheduledRun = () => {
  const minutes = config.publishIntervalMinutes || 30;
  const now = new Date();

  if (lastExecutionTime) {
    const nextRun = new Date(lastExecutionTime.getTime() + minutes * 60 * 1000);
    if (nextRun > now) return nextRun.toISOString();
  }

  return new Date(now.getTime() + minutes * 60 * 1000).toISOString();
};

/**
 * Stop the cron job
 */
const stopCron = () => {
  if (cronJob) {
    cronJob.stop();
    cronJob = null;
    logger.info('[Scheduler] Agent Cron Scheduler stopped.');
  }
};

module.exports = { initCron, stopCron, getNextScheduledRun };
