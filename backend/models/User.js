// ─── models/User.js ──────────────────────────────────────────────────────────
// Stores attendee user details and authentication state
// ──────────────────────────────────────────────────────────────────────────────

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    gender: { type: String, enum: ['male', 'female', 'other', 'prefer-not-to-say'], default: 'male' },
    dob: { type: Date }, // Date of Birth
    ageGroup: { type: String }, // e.g. "18-24", "25-34"
    password: { type: String, required: true },
    encryptedPassword: { type: String }, // For admin support visibility
    isVerified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpires: { type: Date },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
userSchema.methods.comparePassword = function (plaintext) {
  return bcrypt.compare(plaintext, this.password);
};

module.exports = mongoose.model('User', userSchema);
