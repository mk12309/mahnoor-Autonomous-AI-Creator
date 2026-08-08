/**
 * Post Mongoose Model
 * 
 * Responsibility:
 * Defines the schema for posts saved into MongoDB by the Publishing Service.
 * Ensures every post includes: id, createdAt, text, rationale, and sources.
 */

const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    topicId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Topic' 
    },
    text: { 
      type: String, 
      required: true 
    },
    rationale: { 
      type: String, 
      required: true,
      default: 'Selected as the top-scoring AI infrastructure topic for high analytical value.'
    },
    sources: [
      {
        title: { type: String },
        url: { type: String }
      }
    ],
    hashtags: [{ type: String }],
    status: { 
      type: String, 
      enum: ['draft', 'queued', 'approved', 'published', 'rejected'], 
      default: 'published' 
    },
    publishedAt: { 
      type: Date, 
      default: Date.now 
    },
    linkedinPostId: { type: String }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

module.exports = mongoose.model('Post', postSchema);
