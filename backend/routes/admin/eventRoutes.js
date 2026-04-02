const express = require('express');
const router = express.Router();

// Auto-Injected Common Dependencies
const csv = require('csv-parser');
const fsModule = require('fs');
const pathModule = require('path');
const { v4: uuidv4 } = require('uuid');
const { decrypt, encrypt } = require('../../utils/encryption');
const { upload, uploadSponsor, uploadMedia } = require('../../utils/multerConfig');
const mongoose = require('mongoose');
const User = require('../../models/User');
const Payment = require('../../models/Payment');
const Booking = require('../../models/Booking');
const Event = require('../../models/Event');
const PromoCode = require('../../models/PromoCode');
const { generateQR, generatePDF } = require('../../utils/ticketGenerator');
const { sendTicket } = require('../../utils/emailService');

// ── EVENT MANAGEMENT ROUTES ─────────────────────────────────────────────────

/**
 * GET /api/admin/events
 * Returns ALL events for management
 */
router.get('/events', async (req, res) => {
  try {
    const events = await Event.find({}).sort({ createdAt: -1 }).lean();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * PUT /api/admin/events/:id
 * Update specific event
 */
router.put('/events/:id', async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json({ message: 'Event updated successfully', event });
  } catch (err) {
    console.error('Update event error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


/**
 * POST /api/admin/events
 * Create new event
 */
router.post('/events', async (req, res) => {
  try {
    const event = new Event(req.body);
    if (!event.slug && event.name) {
      event.slug = event.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    }
    await event.save();
    res.status(201).json({ message: 'Event created', event });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * DELETE /api/admin/events/:id
 * Permanently delete an event (hard delete)
 * If event has bookings, archives it instead (soft delete) to preserve records
 */
router.delete('/events/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    // Check for existing bookings
    const bookingCount = await Booking.countDocuments({ eventId: req.params.id });

    if (bookingCount > 0) {
      // Soft delete — archive to preserve records
      event.isArchived = true;
      event.status = 'Completed';
      await event.save();
      return res.json({ 
        message: `Event archived (not deleted) because it has ${bookingCount} associated booking(s). Financial records preserved.`,
        archived: true,
        event 
      });
    }

    // Hard delete — no bookings
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event permanently deleted', deleted: true });
  } catch (err) {
    console.error('Delete event error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});



module.exports = router;
