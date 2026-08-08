const mongoose = require('mongoose');

const personaConfigSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      default: 'AI Infrastructure Analyst',
    },
    tone: {
      type: String,
      enum: ['professional', 'thought-leader', 'technical', 'casual', 'provocative'],
      default: 'professional',
    },
    style: {
      type: String,
      enum: ['analytical', 'conversational', 'storytelling', 'data-driven', 'opinion'],
      default: 'analytical',
    },
    targetAudience: {
      type: String,
      default: 'Tech professionals, CTOs, AI engineers, and startup founders',
    },
    postLength: {
      type: String,
      enum: ['short', 'medium', 'long'],
      default: 'medium',
    },
    hashtagStrategy: {
      type: String,
      default: '3-5 relevant hashtags per post',
    },
    avoidTopics: {
      type: [String],
      default: [],
    },
    focusAreas: {
      type: [String],
      default: ['AI infrastructure', 'MLOps', 'LLMs', 'cloud computing', 'developer tools'],
    },
    customInstructions: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('PersonaConfig', personaConfigSchema);
