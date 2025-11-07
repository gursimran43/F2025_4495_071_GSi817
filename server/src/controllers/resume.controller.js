const Resume = require('../models/Resume');
const User = require('../models/User');
const OnboardingData = require('../models/OnboardingData');
const GeminiService = require('../utils/geminiService');

// @desc    Get user's resumes
// @route   GET /api/resumes
// @access  Private
exports.getResumes = async (req, res, next) => {
  try {
    const resumes = await Resume.find({ userId: req.user._id })
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        resumes,
        count: resumes.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single resume
// @route   GET /api/resumes/:id
// @access  Private
exports.getResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { resume },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create resume
// @route   POST /api/resumes
// @access  Private
exports.createResume = async (req, res, next) => {
  try {
    const { personalInfo, experiences, education, skills, template } = req.body;

    const resume = await Resume.create({
      userId: req.user._id,
      personalInfo,
      experiences: experiences || [],
      education: education || [],
      skills: skills || '',
      template: template || 'modern',
    });

    console.log(`✅ New resume created for user: ${req.user._id}`);

    res.status(201).json({
      success: true,
      message: 'Resume created successfully',
      data: { resume },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update resume
// @route   PUT /api/resumes/:id
// @access  Private
exports.updateResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found',
      });
    }

    // Update resume fields
    Object.assign(resume, req.body);
    await resume.save();

    console.log(`✅ Resume updated: ${resume._id}`);

    res.status(200).json({
      success: true,
      message: 'Resume updated successfully',
      data: { resume },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete resume
// @route   DELETE /api/resumes/:id
// @access  Private
exports.deleteResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user._id 
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found',
      });
    }

    console.log(`🗑️ Resume deleted: ${resume._id}`);

    res.status(200).json({
      success: true,
      message: 'Resume deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle resume public status
// @route   PATCH /api/resumes/:id/toggle-public
// @access  Private
exports.toggleResumePublic = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found',
      });
    }

    resume.isPublic = !resume.isPublic;
    await resume.save();

    const status = resume.isPublic ? 'public' : 'private';
    console.log(`👁️ Resume marked as ${status}: ${resume._id}`);

    res.status(200).json({
      success: true,
      message: `Resume marked as ${status}`,
      data: { resume },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate resume content with AI
// @route   POST /api/resumes/generate-ai
// @access  Private
exports.generateResumeWithAI = async (req, res, next) => {
  try {
    console.log(`🤖 Starting AI resume generation for user: ${req.user._id}`);

    // Get user data
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Get onboarding data for personalization
    const onboardingData = await OnboardingData.findOne({ userId: req.user._id });

    if (!onboardingData) {
      console.log('⚠️ No onboarding data found, using basic user info');
    }

    // Generate resume content with AI
    const resumeContent = await GeminiService.generateResumeContent(
      {
        name: user.name,
        email: user.email
      },
      onboardingData
    );

    console.log('✅ AI resume content generated successfully');

    res.status(200).json({
      success: true,
      message: 'Resume content generated successfully',
      data: { resumeContent },
    });

  } catch (error) {
    console.error('❌ Error generating AI resume:', error);
    next(error);
  }
};