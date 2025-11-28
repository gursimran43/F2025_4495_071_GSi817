const InterviewSession = require('../models/InterviewSession');
const Task = require('../models/Task');
const OnboardingData = require('../models/OnboardingData');
const GeminiService = require('../utils/geminiService');

// Start a new interview session
exports.startInterview = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get completed tasks
    const completedTasks = await Task.find({ userId, completed: true });

    if (completedTasks.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'You need to complete at least one task before starting interview preparation.',
      });
    }

    // Get user's onboarding data for personalization
    const onboardingData = await OnboardingData.findOne({ userId });

    // Generate interview questions using AI
    const questions = await GeminiService.generateInterviewQuestions(
      completedTasks,
      onboardingData
    );

    // Create new interview session
    const interviewSession = new InterviewSession({
      userId,
      questions,
      answers: [],
      status: 'in_progress',
    });

    await interviewSession.save();

    // Return questions without correct answers
    const questionsForClient = questions.map(q => ({
      question: q.question,
      type: q.type,
      options: q.options,
      category: q.category,
      relatedTask: q.relatedTask,
    }));

    res.json({
      success: true,
      message: 'Interview session started successfully',
      data: {
        sessionId: interviewSession._id,
        questions: questionsForClient,
      },
    });
  } catch (error) {
    console.error('Error starting interview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start interview session',
      error: error.message,
    });
  }
};

// Submit answers and get evaluation
exports.submitAnswers = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { answers } = req.body;
    const userId = req.user._id;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'Answers array is required',
      });
    }

    // Find the interview session
    const session = await InterviewSession.findOne({ _id: sessionId, userId });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found',
      });
    }

    if (session.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'This interview session has already been completed',
      });
    }

    // Evaluate answers using AI
    const evaluations = await GeminiService.evaluateInterviewAnswers(
      session.questions,
      answers
    );

    // Combine user answers with evaluations
    const evaluatedAnswers = answers.map((answer, index) => {
      const evaluation = evaluations.find(e => e.questionIndex === index) || {
        questionIndex: index,
        isCorrect: false,
        score: 0,
        feedback: 'Could not evaluate this answer',
      };

      return {
        questionIndex: answer.questionIndex,
        userAnswer: answer.userAnswer,
        isCorrect: evaluation.isCorrect,
        score: evaluation.score,
        feedback: evaluation.feedback,
      };
    });

    // Calculate total score
    const totalScore =
      evaluatedAnswers.reduce((sum, answer) => sum + answer.score, 0) /
      evaluatedAnswers.length;

    // Update session
    session.answers = evaluatedAnswers;
    session.totalScore = Math.round(totalScore);
    session.status = 'completed';
    session.completedAt = new Date();

    await session.save();

    res.json({
      success: true,
      message: 'Answers submitted and evaluated successfully',
      data: {
        sessionId: session._id,
        totalScore: session.totalScore,
        answers: evaluatedAnswers,
        questions: session.questions.map(q => ({
          question: q.question,
          type: q.type,
          options: q.options,
          correctAnswer: q.correctAnswer,
          expectedKeywords: q.expectedKeywords,
          category: q.category,
          relatedTask: q.relatedTask,
        })),
      },
    });
  } catch (error) {
    console.error('Error submitting answers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit and evaluate answers',
      error: error.message,
    });
  }
};

// Get interview history
exports.getInterviewHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    const sessions = await InterviewSession.find({ userId })
      .sort({ createdAt: -1 })
      .select('status totalScore completedAt createdAt questions answers')
      .limit(10);

    const stats = {
      totalAttempts: sessions.length,
      completedAttempts: sessions.filter(s => s.status === 'completed').length,
      averageScore: sessions.length > 0
        ? Math.round(
            sessions
              .filter(s => s.totalScore)
              .reduce((sum, s) => sum + s.totalScore, 0) / sessions.filter(s => s.totalScore).length
          )
        : 0,
      bestScore: sessions.length > 0
        ? Math.max(...sessions.map(s => s.totalScore || 0))
        : 0,
    };

    res.json({
      success: true,
      data: {
        sessions: sessions.map(s => ({
          id: s._id,
          status: s.status,
          totalScore: s.totalScore,
          questionCount: s.questions.length,
          completedAt: s.completedAt,
          createdAt: s.createdAt,
        })),
        stats,
      },
    });
  } catch (error) {
    console.error('Error fetching interview history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch interview history',
      error: error.message,
    });
  }
};

// Get specific interview session results
exports.getSessionResults = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user._id;

    const session = await InterviewSession.findOne({ _id: sessionId, userId });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found',
      });
    }

    res.json({
      success: true,
      data: {
        session: {
          id: session._id,
          status: session.status,
          totalScore: session.totalScore,
          completedAt: session.completedAt,
          questions: session.questions.map(q => ({
            question: q.question,
            type: q.type,
            options: q.options,
            correctAnswer: q.correctAnswer,
            expectedKeywords: q.expectedKeywords,
            category: q.category,
            relatedTask: q.relatedTask,
          })),
          answers: session.answers,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching session results:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch session results',
      error: error.message,
    });
  }
};

// Check if user can start interview (has completed tasks)
exports.checkInterviewAvailability = async (req, res) => {
  try {
    const userId = req.user._id;

    const completedTasksCount = await Task.countDocuments({ userId, completed: true });

    res.json({
      success: true,
      data: {
        canStartInterview: completedTasksCount > 0,
        completedTasksCount,
        message: completedTasksCount > 0
          ? `You have ${completedTasksCount} completed task${completedTasksCount > 1 ? 's' : ''} to practice with!`
          : 'Complete at least one task to unlock interview preparation.',
      },
    });
  } catch (error) {
    console.error('Error checking interview availability:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check interview availability',
      error: error.message,
    });
  }
};
