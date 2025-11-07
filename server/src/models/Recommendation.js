const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['course', 'project', 'certification', 'network'],
      required: true,
    },
    relevance: {
      type: String,
      default: '',
    },
    // Enhanced metadata for specific resources
    platform: {
      type: String,
      default: '',
    },
    provider: {
      type: String,
      default: '',
    },
    link: {
      type: String,
      default: '',
    },
    format: {
      type: String,
      default: '',
    },
    level: {
      type: String,
      default: '',
    },
    duration: {
      type: String,
      default: '',
    },
    price: {
      type: String,
      default: '',
    },
    // Arrays for additional details
    outcomes: {
      type: [String],
      default: [],
    },
    bonuses: {
      type: [String],
      default: [],
    },
    focusAreas: {
      type: [String],
      default: [],
    },
    highlights: {
      type: [String],
      default: [],
    },
    // Additional metadata
    audience: {
      type: String,
      default: '',
    },
    aiGenerated: {
      type: Boolean,
      default: false,
    },
    dismissed: {
      type: Boolean,
      default: false,
    },
    clicked: {
      type: Boolean,
      default: false,
    },
    generatedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
recommendationSchema.index({ userId: 1, type: 1 });
recommendationSchema.index({ userId: 1, dismissed: 1 });

module.exports = mongoose.model('Recommendation', recommendationSchema);