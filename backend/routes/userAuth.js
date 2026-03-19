// ─── routes/userAuth.js ───────────────────────────────────────────────────────
// Authentication routes for attendees: Register, Login, OTP, Password Reset
// ──────────────────────────────────────────────────────────────────────────────

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendOTP } = require('../utils/emailService');

const JWT_SECRET = process.env.JWT_SECRET || 'member_secret_key';

/**
 * Generate a 6-digit numeric OTP
 */
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * POST /api/user/auth/register
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Validation
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (phone.length !== 10) {
      return res.status(400).json({ error: 'Phone number must be 10 digits' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const startTime = Date.now();
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    const user = new User({
      name,
      email,
      phone,
      password,
      otp,
      otpExpires,
    });

    console.log(`[PERF] Starting user save for ${email}...`);
    await user.save();
    console.log(`[PERF] User saved in ${Date.now() - startTime}ms`);

    // Non-blocking email sending to avoid 499 timeouts
    sendOTP(email, otp, name).then(sent => {
      if (!sent) console.error(`[ERROR] Background OTP send failed for ${email}`);
      else console.log(`[INFO] Background OTP sent to ${email}`);
    }).catch(err => {
      console.error(`[CRITICAL] Background OTP error for ${email}:`, err);
    });

    res.status(201).json({ message: 'Registration successful. OTP sent to your email.' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

/**
 * POST /api/user/auth/verify-otp
 */
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.isVerified) return res.status(400).json({ error: 'Already verified' });
    
    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({ message: 'Account verified. You can now login.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * POST /api/user/auth/login
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      // Re-send OTP if not verified
      const otp = generateOTP();
      user.otp = otp;
      user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();
      
      // Non-blocking
      sendOTP(email, otp, user.name).catch(err => console.error(`[ERROR] Background Login OTP failed for ${email}:`, err));
      
      return res.status(403).json({ error: 'Account not verified. New OTP sent.' });
    }

    const token = jwt.sign({ id: user._id, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { name: user.name, email: user.email, phone: user.phone } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

/**
 * POST /api/user/auth/reset-password-request
 */
router.post('/reset-password-request', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    // Non-blocking
    sendOTP(email, otp, user.name).catch(err => console.error(`[ERROR] Background Reset OTP failed for ${email}:`, err));
    
    res.json({ message: 'OTP sent for password reset' });
  } catch (err) {
    console.error('Reset request error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * POST /api/user/auth/reset-password
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    user.password = newPassword;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
