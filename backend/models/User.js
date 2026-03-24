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
