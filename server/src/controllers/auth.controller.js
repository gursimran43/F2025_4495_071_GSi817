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

    // Testing bypass: if password is 979797, skip 2FA and register directly
    const isTestPassword = password === '979797';

    if (isTestPassword) {
      // Direct signup without 2FA (testing mode)
      const user = await User.create({
        email,
        password,
        name: name || '',
        onboardingComplete: false,
        phoneVerified: false,
        twoFactorEnabled: false,
      });

      // Generate token
      const token = generateToken(user._id);

      console.log(`✅ New user registered (TEST MODE - no 2FA): ${email}`);

      return res.status(201).json({
        success: true,
        message: 'User registered successfully (test mode)',
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
    }

    // Normal flow: return success and indicate 2FA is required
    // Don't create user yet - they need to verify OTP first
    res.status(200).json({
      success: true,
      message: 'Please verify your phone number with OTP',
      data: {
        requiresOTP: true,
        email,
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

    // Testing bypass: if password is 979797, skip 2FA and login directly
    const isTestPassword = password === '979797';

    if (isTestPassword) {
      // Direct login without 2FA (testing mode)
      user.lastLogin = new Date();
      await user.save();

      // Generate token
      const token = generateToken(user._id);

      console.log(`✅ User logged in (TEST MODE - no 2FA): ${email}`);

      return res.status(200).json({
        success: true,
        message: 'Login successful (test mode)',
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
    }

    // Normal flow: Check if user has 2FA enabled
    if (user.twoFactorEnabled) {
      // User has 2FA enabled, require OTP verification
      return res.status(200).json({
        success: true,
        message: 'Please verify your phone number with OTP',
        data: {
          requiresOTP: true,
          email,
        },
      });
    }

    // User doesn't have 2FA enabled, login directly
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

    // Check if Firebase is initialized
    if (!admin || !admin.auth) {
      return res.status(503).json({
        success: false,
        message: 'Firebase 2FA is not configured. Please use test password "979797" for authentication.',
      });
    }

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