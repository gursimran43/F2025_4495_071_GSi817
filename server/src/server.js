const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Trust proxy for proper IP forwarding
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// CORS - Allow all origins as requested
app.use(cors({
  origin: true, // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// API Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/onboarding', require('./routes/onboarding.routes'));
app.use('/api/tasks', require('./routes/task.routes'));
app.use('/api/recommendations', require('./routes/recommendation.routes'));
app.use('/api/resumes', require('./routes/resume.routes'));
app.use('/api/analytics', require('./routes/analytics.routes'));
app.use('/api/interview', require('./routes/interview'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'GoalFlow API is running smoothly! 🚀',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🎯 Welcome to GoalFlow API - AI-Powered Career Development Platform',
    version: '1.0.0',
    documentation: '/api/health',
    endpoints: {
      auth: '/api/auth',
      onboarding: '/api/onboarding',
      tasks: '/api/tasks',
      recommendations: '/api/recommendations',
      resumes: '/api/resumes',
      analytics: '/api/analytics',
      interview: '/api/interview',
    }
  });
});

// Handle 404 - Route not found
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log('\n🎯========================================🎯');
  console.log('       GOALFLOW API SERVER STARTED        ');
  console.log('🎯========================================🎯');
  console.log(`🚀 Server running on port: ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🤖 Gemini AI: ${process.env.GEMINI_API_KEY ? '✅ Configured' : '❌ Missing API Key'}`);
  console.log(`🗄️ MongoDB: Connected`);
  console.log(`🔒 CORS: All origins allowed (as requested)`);
  console.log(`⚡ Rate Limiting: Disabled (as requested)`);
  console.log('🎯========================================🎯\n');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`❌ Uncaught Exception: ${err.message}`);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Process terminated');
  });
});

module.exports = app;