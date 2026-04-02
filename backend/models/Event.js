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
    status: { type: String, enum: ['Active', 'Draft', 'Sold Out', 'Completed'], default: 'Active' },
    isArchived: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    slug: { type: String, unique: true, sparse: true }, // Sparse to allow old events without slugs
    tags: { type: [String], default: [] },
    imageUrl: { type: String, default: '' },
    videoUrl: { type: String, default: '' },
    media: [
      {
        url: { type: String, required: true },
        type: { type: String, enum: ['image', 'video'], default: 'image' },
        role: { type: String, enum: ['cover', 'hero_video', 'hero_image', 'gallery'], default: 'gallery' }
      }
    ],
    displayUntil: { type: Date }, // Set duration for how long your event appears
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);
