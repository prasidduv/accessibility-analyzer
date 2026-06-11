const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

function createToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
}

function sendAuthSuccess(res, user, statusCode = 200) {
  const token = createToken(user._id);

  return res.status(statusCode).json({
    success: true,
    message: statusCode === 201 ? 'Account created successfully. Welcome!' : 'Logged in successfully. Welcome back!',
    token,
    user: user.toPublicJSON()
  });
}

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please enter your name to create an account.'
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please enter your email address.'
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Please choose a password.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists. Try logging in instead.'
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password
    });

    return sendAuthSuccess(res, user, 201);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors)
        .map((err) => err.message)
        .join(' ');

      return res.status(400).json({
        success: false,
        message: message || 'Please check your registration details and try again.'
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists. Try logging in instead.'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'We could not create your account right now. Please try again in a moment.'
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please enter your email address.'
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Please enter your password.'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'We could not find an account with that email. Please check and try again.'
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password. Please try again.'
      });
    }

    return sendAuthSuccess(res, user);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'We could not log you in right now. Please try again in a moment.'
    });
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  try {
    return res.json({
      success: true,
      user: req.user.toPublicJSON()
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'We could not load your profile. Please try again.'
    });
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please enter the email address linked to your account.'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'We could not find an account with that email address.'
      });
    }

    return res.json({
      success: true,
      message: 'If an account exists for that email, password reset instructions have been sent. Please check your inbox.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'We could not process your password reset request. Please try again later.'
    });
  }
});

router.post('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please enter your current password.'
      });
    }

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a new password.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.'
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Your new password must be different from your current password.'
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'We could not find your account. Please log in again.'
      });
    }

    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Your current password is incorrect.'
      });
    }

    user.password = newPassword;
    await user.save();

    return res.json({
      success: true,
      message: 'Your password has been updated successfully.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'We could not update your password right now. Please try again.'
    });
  }
});

module.exports = router;
