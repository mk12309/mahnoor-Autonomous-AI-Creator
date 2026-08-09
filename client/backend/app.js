/**
 * Express Application Initialization
 */

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const config = require('./config/env');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root Welcome Endpoint
app.get('/', (req, res) => {
  res.status(200).send(`⚡ SignalForge AI Backend API Service Online`);
});

// Health Check Endpoint
app.get('/health', async (req, res) => {
  let mongoStatus = 'disconnected';
  try {
    mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  } catch (_) {}

  let breethStatus = 'disconnected';
  try {
    const breethMemory = require('./services/breeth-memory.service');
    const result = await breethMemory.healthCheck();
    breethStatus = result.connected ? 'connected' : 'disconnected';
  } catch (_) {}

  res.status(200).json({
    status: 'OK',
    service: 'SignalForge AI Backend',
    mongodb: mongoStatus,
    breeth: breethStatus,
    mongoUriSet: Boolean(config.mongoUri && config.mongoUri.length > 10),
    timestamp: new Date().toISOString()
  });
});

// Database Connection Middleware — validates MongoDB connection before any API route executes
app.use(async (req, res, next) => {
  if (mongoose.connection.readyState === 1) {
    return next();
  }

  const connectDB = require('./database/db');
  try {
    const conn = await connectDB();
    if (!conn || mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        error: 'MongoDB Atlas Connection Failed',
        message: 'Backend could not connect to MongoDB Atlas. Please check MONGODB_URI in Vercel environment variables and ensure MongoDB Atlas Network Access allows 0.0.0.0/0.',
        envConfigured: Boolean(config.mongoUri && config.mongoUri.length > 10)
      });
    }
    next();
  } catch (err) {
    return res.status(503).json({
      success: false,
      error: 'MongoDB Atlas Connection Exception',
      message: err.message,
      envConfigured: Boolean(config.mongoUri && config.mongoUri.length > 10)
    });
  }
});

app.use('/api', routes);
app.use(errorHandler);

module.exports = app;
