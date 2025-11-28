const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['mcq', 'short'],
    required: true,
  },
  // For MCQ questions
  options: [{
    type: String,
  }],
  correctAnswer: {
    type: String,
  },
  // For short answer questions
  expectedKeywords: [{
    type: String,
  }],
  // Reference to which task this question is about
  relatedTask: {
    type: String,
  },
  category: {
    type: String,
  },
});

const answerSchema = new mongoose.Schema({
  questionIndex: {
    type: Number,
    required: true,
  },
  userAnswer: {
    type: String,
    required: true,
  },
  isCorrect: {
    type: Boolean,
  },
  score: {
    type: Number,
    min: 0,
    max: 100,
  },
  feedback: {
    type: String,
  },
});

const interviewSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    questions: [questionSchema],
    answers: [answerSchema],
    status: {
      type: String,
      enum: ['in_progress', 'completed'],
      default: 'in_progress',
    },
    totalScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    completedAt: {
      type: Date,
    },
    aiGenerated: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
interviewSessionSchema.index({ userId: 1, status: 1 });
interviewSessionSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('InterviewSession', interviewSessionSchema);
