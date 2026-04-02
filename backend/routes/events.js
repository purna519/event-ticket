// ─── routes/events.js ─────────────────────────────────────────────────────────
// Public event information endpoint
// ──────────────────────────────────────────────────────────────────────────────

const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Event = require('../models/Event');

/**
 * GET /api/events
 * Returns all active events
 */
router.get('/', async (req, res) => {
  try {
    const events = await Event.find({ isArchived: false }).lean();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * GET /api/events/:id_or_slug
 * Returns a specific event with current booking stats
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const mongoose = require('mongoose');
    let event;
    
    if (mongoose.Types.ObjectId.isValid(id)) {
      event = await Event.findById(id).lean();
    } else {
      event = await Event.findOne({ slug: id }).lean();
    }

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Calculate current reserved tickets for this specific event
    const bookings = await Booking.find({ 
        eventId: event._id, 
        status: { $in: ['verified', 'pending'] } 
    }).select('quantity');
    
    const reservedTickets = bookings.reduce((sum, b) => sum + (b.quantity || 1), 0);

    res.json({ ...event, reservedTickets });
  } catch (err) {
    console.error('Events error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
