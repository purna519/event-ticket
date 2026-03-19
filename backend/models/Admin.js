// ─── models/Admin.js ──────────────────────────────────────────────────────────
// Admin user model for JWT-authenticated admin panel access
// ──────────────────────────────────────────────────────────────────────────────

const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Admin', adminSchema);
