// ─── models/Payment.js ────────────────────────────────────────────────────────
// Stores real UPI payment records uploaded by admin (CSV or manual).
// Each UTR is unique and can only be matched once.
// ──────────────────────────────────────────────────────────────────────────────

const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    // UTR = Unique Transaction Reference from UPI
    utr: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    amount: { type: Number, required: true },
    used: { type: Boolean, default: false },   // true once matched to a booking
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);


module.exports = mongoose.model('Payment', paymentSchema);
