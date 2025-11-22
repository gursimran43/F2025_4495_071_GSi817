const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { admin } = require('../config/firebase.config');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// @desc    Register new user
// @route   POST /api/auth/signup
// @access  Public
exports.signup = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      name: name || '',
      onboardingComplete: false,
    });

    // Generate token
    const token = generateToken(user._id);

    console.log(`✅ New user registered: ${email}`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          onboardingComplete: user.onboardingComplete,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    console.log(`✅ User logged in: ${email}`);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          onboardingComplete: user.onboardingComplete,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          onboardingComplete: user.onboardingComplete,
          lastLogin: user.lastLogin,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, onboardingComplete } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        ...(name && { name }),
        ...(onboardingComplete !== undefined && { onboardingComplete })
      },
      { new: true, runValidators: true }
    );

    console.log(`✅ User profile updated: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          onboardingComplete: user.onboardingComplete,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP and create/login user
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOtp = async (req, res, next) => {
  try {
    const { email, password, name, phoneNumber, firebaseToken, mode } = req.body;

    // Verify Firebase token
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(firebaseToken);

      // Verify that the phone number matches
      if (decodedToken.phone_number !== phoneNumber) {
        return res.status(400).json({
          success: false,
          message: 'Phone number mismatch',
        });
      }
    } catch (error) {
      console.error('Firebase token verification error:', error);
      return res.status(401).json({
        success: false,
        message: 'Invalid OTP or verification failed',
      });
    }

    let user;

    if (mode === 'signup') {
      // Check if user already exists
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email',
        });
      }

      // Create new user with verified phone
      user = await User.create({
        email,
        password,
        name: name || '',
        phoneNumber,
        phoneVerified: true,
        twoFactorEnabled: true,
        onboardingComplete: false,
      });

      console.log(`✅ New user registered with 2FA: ${email}`);
    } else {
      // Login mode - verify credentials
      user = await User.findOne({ email }).select('+password');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      // Check password
      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      // Update phone verification status
      user.phoneNumber = phoneNumber;
      user.phoneVerified = true;
      user.twoFactorEnabled = true;
      user.lastLogin = new Date();
      await user.save();

      console.log(`✅ User logged in with 2FA: ${email}`);
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(mode === 'signup' ? 201 : 200).json({
      success: true,
      message: mode === 'signup' ? 'User registered successfully' : 'Login successful',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          phoneNumber: user.phoneNumber,
          phoneVerified: user.phoneVerified,
          twoFactorEnabled: user.twoFactorEnabled,
          onboardingComplete: user.onboardingComplete,
        },
        token,
      },
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    next(error);
  }
};