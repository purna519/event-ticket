// ─── models/Booking.js ────────────────────────────────────────────────────────
// Stores user booking submissions with verification status and multiple tickets
// ──────────────────────────────────────────────────────────────────────────────

const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    utr: {
      type: String,
      uppercase: true,
      trim: true,
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    userUpiId: { type: String }, // To facilitate collect requests
    quantity: { type: Number, default: 1 },
    ticketId: { type: String, default: null }, // Primary ID (legacy/first ticket)
    tickets: [
      {
        ticketId: { type: String, required: true },
        scanned: { type: Boolean, default: false },
        scannedAt: { type: Date, default: null },
      }
    ],
    rejectionReason: { type: String, default: null },
    // Reference to the matched payment record
    paymentRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      default: null,
    },
  },
  { timestamps: true }
);

// Index for UTR lookups to prevent duplicate submissions
bookingSchema.index({ utr: 1 });
// Index for scanning tickets
bookingSchema.index({ 'tickets.ticketId': 1 });

module.exports = mongoose.model('Booking', bookingSchema);
