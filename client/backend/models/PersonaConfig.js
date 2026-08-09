/**
 * Persona Config Mongoose Model
 * 
 * Responsibility:
 * Defines the schema for the AI Persona dynamic runtime configuration.
 * Configures tone, post style, audience targeting, and focus areas.
 */

const mongoose = require('mongoose');

const personaConfigSchema = new mongoose.Schema(
  {
    name: { type: String, default: 'AI Infrastructure Analyst' },
    tone: { type: String, default: 'professional' },
    style: { type: String, default: 'analytical' },
    targetAudience: { type: String },
    postLength: { type: String, default: 'medium' },
    focusAreas: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PersonaConfig', personaConfigSchema);
