// ─── routes/events.js ─────────────────────────────────────────────────────────
// Public event information endpoint
// ──────────────────────────────────────────────────────────────────────────────

const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Event = require('../models/Event');

/**
 * GET /api/events/current
 * Returns the first (active) event in the DB with current booking stats
 */
router.get('/current', async (req, res) => {
  try {
    const event = await Event.findOne({}).lean();
    if (!event) {
      return res.status(404).json({ error: 'No event configured' });
    }

    // Calculate current reserved tickets (sum of quantity for verified/pending)
    const bookings = await Booking.find({ status: { $in: ['verified', 'pending'] } }).select('quantity');
    const reservedTickets = bookings.reduce((sum, b) => sum + (b.quantity || 1), 0);

    res.json({ ...event, reservedTickets });
  } catch (err) {
    console.error('Events error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
