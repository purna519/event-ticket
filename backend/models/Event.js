// ─── models/Event.js ──────────────────────────────────────────────────────────
// Stores event details including UPI payment configuration
// ──────────────────────────────────────────────────────────────────────────────

const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    date: { type: String, required: true },   // e.g. "2026-04-15"
    time: { type: String, required: true },   // e.g. "10:00 AM"
    venue: { type: String, required: true },
    locationUrl: { type: String, default: '' },
    description: { type: String, default: '' },
    price: { type: Number, required: true },  // ticket price in INR
    totalCapacity: { type: Number, default: 150 }, // Max tickets allowed
    upiId: { type: String, required: true },  // e.g. yourname@upi
    upiName: { type: String, required: true },
    upiNote: { type: String, default: 'TicketPayment' },
    benefits: { type: [String], default: [] }, // e.g. ["Water Bottle", "Flowers", "Food Stall Allocation"]
    supportNumber: { type: String, default: '7093237728' },
    sponsors: [
      {
        name: { type: String, required: true },
        logoUrl: { type: String, required: true },
      }
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);
