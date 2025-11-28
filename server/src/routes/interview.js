const express = require('express');
const router = express.Router();
const {
  startInterview,
  submitAnswers,
  getInterviewHistory,
  getSessionResults,
  checkInterviewAvailability,
} = require('../controllers/interviewController');
const { protect } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(protect);

// Check if user can start interview
router.get('/check-availability', checkInterviewAvailability);

// Start new interview session
router.post('/start', startInterview);

// Submit answers for evaluation
router.post('/:sessionId/submit', submitAnswers);

// Get interview history
router.get('/history', getInterviewHistory);

// Get specific session results
router.get('/:sessionId/results', getSessionResults);

module.exports = router;
