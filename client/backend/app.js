/**
 * Express Application Initialization
 * 
 * Responsibility:
 * Configures global Express middleware (JSON body parser, CORS),
 * mounts top-level API router, defines root status page, and error handling middleware.
 */

const express = require('express');
const cors = require('cors');
const config = require('./config/env');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Enable Cross-Origin Resource Sharing (CORS)
app.use(cors({
  origin: '*',
  credentials: true
}));

// Enable built-in Express JSON parser middleware
app.use(express.json());

// Enable URL-encoded parser middleware
app.use(express.urlencoded({ extended: true }));

// Root Welcome & Status Endpoint for browser visits
app.get('/', (req, res) => {
  res.status(200).send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>⚡ SignalForge AI Backend API Service</title>
      <style>
        body { background-color: #090d16; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; line-height: 1.6; }
        .card { max-width: 600px; margin: 0 auto; background: #0f172a; padding: 30px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        h1 { color: #38bdf8; font-size: 24px; margin-top: 0; }
        .badge { background: rgba(56, 189, 248, 0.1); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); padding: 4px 10px; border-radius: 99px; font-size: 12px; font-family: monospace; display: inline-block; margin-bottom: 15px; }
        ul { padding-left: 20px; }
        li { margin-bottom: 8px; }
        a { color: #38bdf8; text-decoration: none; font-weight: bold; }
        a:hover { text-decoration: underline; }
        code { background: #1e293b; color: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-family: monospace; }
      </style>
    </head>
    <body>
      <div class="card">
        <span class="badge">● BACKEND SERVICE ONLINE</span>
        <h1>⚡ SignalForge AI API Service</h1>
        <p>Autonomous AI Infrastructure Analyst Backend is running successfully.</p>
        
        <h3>📡 Available Hackathon API Endpoints:</h3>
        <ul>
          <li><strong>Agent Feed API:</strong> <a href="/api/agent/feed"><code>GET /api/agent/feed</code></a></li>
          <li><strong>Initialize Agent API:</strong> <code>POST /api/agent/init</code></li>
          <li><strong>Health Check API:</strong> <a href="/health"><code>GET /health</code></a></li>
        </ul>

        <h3>🎨 Frontend Dashboard:</h3>
        <p>To view the visual interface, open <a href="http://localhost:5173" target="_blank">http://localhost:5173</a> in your browser.</p>
      </div>
    </body>
    </html>
  `);
});

// Health Check Endpoint — performs real Breeth connectivity check
app.get('/health', async (req, res) => {
  let breethStatus = 'disconnected';
  let mongoStatus = 'unknown';

  // Check MongoDB
  try {
    const mongoose = require('mongoose');
    mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  } catch (_) {
    mongoStatus = 'disconnected';
  }

  // Check Breeth — real HTTP request via healthCheck()
  try {
    const breethMemory = require('./services/breeth-memory.service');
    const result = await breethMemory.healthCheck();
    breethStatus = result.connected ? 'connected' : 'disconnected';
  } catch (_) {
    breethStatus = 'disconnected';
  }

  // Check scheduler
  let schedulerStatus = 'inactive';
  try {
    const { getNextScheduledRun } = require('./scheduler/cron');
    const nextRun = getNextScheduledRun();
    schedulerStatus = nextRun ? 'active' : 'inactive';
  } catch (_) {}

  res.status(200).json({
    status: 'OK',
    service: 'SignalForge AI Backend',
    mongodb: mongoStatus,
    breeth: breethStatus,
    scheduler: schedulerStatus,
    timestamp: new Date().toISOString()
  });
});

// Mount API Routes
app.use('/api', routes);

// Global Error Handling Middleware
app.use(errorHandler);

module.exports = app;
