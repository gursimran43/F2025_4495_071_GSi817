const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
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
    completed: {
      type: Boolean,
      default: false,
    },
    percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium',
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    aiGenerated: {
      type: Boolean,
      default: false,
    },
    estimatedDuration: {
      type: String,
      default: '1 week',
    },
    subtasks: [{
      title: {
        type: String,
        required: true,
      },
      completed: {
        type: Boolean,
        default: false,
      },
    }],
    resources: [{
      type: String,
    }],
    generatedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
taskSchema.index({ userId: 1, completed: 1 });
taskSchema.index({ userId: 1, priority: 1 });

// Auto-calculate percentage based on subtasks
taskSchema.pre('save', function(next) {
  // Calculate percentage based on completed subtasks
  if (this.subtasks && this.subtasks.length > 0) {
    const completedCount = this.subtasks.filter(st => st.completed).length;
    this.percentage = Math.round((completedCount / this.subtasks.length) * 100);

    // Auto-complete task when all subtasks are done
    if (this.percentage === 100) {
      this.completed = true;
      this.completedAt = new Date();
    } else if (this.percentage < 100) {
      this.completed = false;
      this.completedAt = null;
    }
  } else {
    // Legacy behavior for tasks without subtasks
    if (this.isModified('completed')) {
      if (this.completed) {
        this.completedAt = new Date();
        this.percentage = 100;
      } else {
        this.completedAt = null;
      }
    }

    // Auto-complete when percentage reaches 100
    if (this.isModified('percentage') && this.percentage >= 100) {
      this.completed = true;
      this.completedAt = new Date();
    }
  }

  next();
});

module.exports = mongoose.model('Task', taskSchema);