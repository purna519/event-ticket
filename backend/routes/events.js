// ─── routes/events.js ─────────────────────────────────────────────────────────
// Public event information endpoint
// ──────────────────────────────────────────────────────────────────────────────

const express = require('express');
const router = express.Router();
const Event = require('../models/Event');

/**
 * GET /api/events/current
 * Returns the first (active) event in the DB
 */
router.get('/current', async (req, res) => {
  try {
    const event = await Event.findOne({}).lean();
    if (!event) {
      return res.status(404).json({ error: 'No event configured' });
    }
    res.json(event);
  } catch (err) {
    console.error('Events error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
