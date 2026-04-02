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

// ── GET /api/admin/bookings ───────────────────────────────────────────────────
router.get('/bookings', async (req, res) => {
  try {
    const { eventId } = req.query;
    const filter = eventId ? { eventId } : {};
    
    const bookings = await Booking.find(filter)
      .sort({ createdAt: -1 })
      .lean();
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ── GET /api/admin/bookings/export ──────────────────────────────────────────
// Export all bookings as CSV with comprehensive data
router.get('/bookings/export', async (req, res) => {
  try {
    const bookings = await Booking.find({}).sort({ createdAt: -1 }).lean();
    
    let csv = 'Name,Email,Phone,Status,Quantity,UTR,Source,Created At\n';
    bookings.forEach(b => {
      csv += `"${b.name}","${b.email}","${b.phone}","${b.status}",${b.quantity},"${b.utr || 'N/A'}","${b.source}","${b.createdAt.toISOString()}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=TMS-All-Bookings.csv');
    res.status(200).send(csv);
  } catch (err) {
    console.error('Bookings export error:', err);
    res.status(500).json({ error: 'Export failed' });
  }
});

// ── PATCH /api/admin/bookings/:id/approve ─────────────────────────────────────
// Manually approve a pending booking and generate ticket
router.patch('/bookings/:id/approve', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    // Generate multi-tickets if not already matching the quantity
    const qty = booking.quantity || 1;
    if (!booking.tickets || booking.tickets.length !== qty) {
      const tickets = [];
      for (let i = 0; i < qty; i++) {
        tickets.push({
          ticketId: 'TKT-' + uuidv4().split('-')[0].toUpperCase() + (qty > 1 ? `-${i+1}` : ''),
          scanned: false,
        });
      }
      booking.tickets = tickets;
      booking.ticketId = tickets[0].ticketId;
    }

    booking.status = 'verified';
    booking.rejectionReason = null;
    await booking.save();

    // If a matching payment exists, mark it as used
    if (booking.utr) {
      const Payment = require('../../models/Payment');
      await Payment.updateOne({ utr: booking.utr }, { used: true });
    }

    // ── Email Ticket to User ──────────────────────────────────────────────────
    try {
      const event = await Event.findOne({}).lean();
      const qrMap = {};
      for (const t of booking.tickets) {
        qrMap[t.ticketId] = await generateQR(t.ticketId);
      }
      const pdfBuffer = await generatePDF(booking, event, qrMap);
      await sendTicket(booking.email, pdfBuffer, booking.name, event.name);
    } catch (mailErr) {
      console.error('Failed to send ticket email:', mailErr);
    }

    res.json({ message: 'Booking approved and ticket sent via email', booking });
  } catch (err) {
    console.error('Approve error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── PATCH /api/admin/bookings/:id/reject ──────────────────────────────────────
// Manually reject a booking (with optional reason)
router.patch('/bookings/:id/reject', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    booking.status = 'rejected';
    booking.rejectionReason = req.body.reason || 'Rejected by admin';
    await booking.save();

    res.json({ message: 'Booking rejected', booking });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ── PUT /api/admin/event ──────────────────────────────────────────────────────
// Update event details (Legacy support + specific event update)
router.put('/event', async (req, res) => {
  try {
    const { eventId, name, date, time, venue, locationUrl, description, price, totalCapacity, upiId, upiName, upiNote, supportNumber, benefits, sponsors, imageUrl, videoUrl, media, status } = req.body;
    
    let event;
    if (eventId) {
      event = await Event.findById(eventId);
    } else {
      event = await Event.findOne({});
    }

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    Object.assign(event, {
      ...(name !== undefined && { name }),
      ...(date !== undefined && { date }),
      ...(time !== undefined && { time }),
      ...(venue !== undefined && { venue }),
      ...(locationUrl !== undefined && { locationUrl }),
      ...(description !== undefined && { description }),
      ...(price !== undefined && { price: parseFloat(price) }),
      ...(totalCapacity !== undefined && { totalCapacity: parseInt(totalCapacity) }),
      ...(upiId !== undefined && { upiId }),
      ...(upiName !== undefined && { upiName }),
      ...(upiNote !== undefined && { upiNote }),
      ...(supportNumber !== undefined && { supportNumber }),
      ...(benefits !== undefined && { benefits }),
      ...(sponsors !== undefined && { sponsors }),
      ...(imageUrl !== undefined && { imageUrl }),
      ...(videoUrl !== undefined && { videoUrl }),
      ...(media !== undefined && { media }),
      ...(status !== undefined && { status }),
    });
    
    await event.save();

    res.json({ message: 'Event updated successfully', event });
  } catch (err) {
    console.error('Update event error:', err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// ── POST /api/admin/verify-ticket ─────────────────────────────────────────────
// FETCH booking details for a ticket ID (handles both raw IDs and pipe-separated QR data)
router.post('/verify-ticket', async (req, res) => {
  try {
    let { ticketId } = req.body;
    if (!ticketId) return res.status(400).json({ error: 'Ticket ID is required' });

    console.log('Verifying Scan Input:', ticketId);

    // 1. Check if it's the structured format (UTR:xxx|TKT:xxx|QTY:x)
    if (ticketId.includes('|')) {
      const parts = ticketId.split('|');
      const tktPart = parts.find(p => p.startsWith('TKT:'));
      if (tktPart) {
        ticketId = tktPart.replace('TKT:', '');
      }
    }

    // 2. Find the booking that contains this ticketId
    let booking = await Booking.findOne({ 'tickets.ticketId': ticketId });
    if (!booking) {
      console.log('Ticket not found in DB:', ticketId);
      return res.status(404).json({ error: 'Invalid or Unknown Ticket' });
    }

    // ── AUTO-FIX: Ensure tickets array matches quantity (for legacy/missing data) ──
    const qty = booking.quantity || 1;
    if (booking.tickets.length < qty) {
      console.log(`Auto-fixing tickets for Booking ${booking._id}: Current ${booking.tickets.length}, Expected ${qty}`);
      
      // Preserve existing tickets and add missing ones
      const existingIds = booking.tickets.map(t => t.ticketId);
      for (let i = booking.tickets.length; i < qty; i++) {
        let newId;
        do {
          newId = 'TKT-' + uuidv4().split('-')[0].toUpperCase() + (qty > 1 ? `-${i+1}` : '');
        } while (existingIds.includes(newId));
        
        booking.tickets.push({
          ticketId: newId,
          scanned: false
        });
        existingIds.push(newId);
      }
      await booking.save();
    }
    // ──────────────────────────────────────────────────────────────────────────────

    // Find the specific ticket to identify the entry point
    const ticket = booking.tickets.find(t => t.ticketId === ticketId);

    res.json({
      message: 'Booking Identified',
      bookingId: booking._id,
      holder: booking.name,
      ticketId: ticket.ticketId,
      quantity: booking.quantity,
      tickets: booking.tickets // Return all tickets for partial check-in UI
    });
  } catch (err) {
    console.error('Verify ticket error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── POST /api/admin/bookings/:id/check-in ──────────────────────────────────────
// Mark specific ticket IDs as scanned within a booking
router.post('/bookings/:id/check-in', async (req, res) => {
  try {
    const { ticketIds } = req.body; // Array of ticket IDs to check in
    if (!Array.isArray(ticketIds) || ticketIds.length === 0) {
      return res.status(400).json({ error: 'At least one ticket ID is required' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    let updatedCount = 0;
    const now = new Date();

    booking.tickets.forEach(t => {
      if (ticketIds.includes(t.ticketId) && !t.scanned) {
        t.scanned = true;
        t.scannedAt = now;
        updatedCount++;
      }
    });

    if (updatedCount > 0) {
      await booking.save();
    }

    res.json({
      message: `${updatedCount} tickets checked in successfully`,
      booking
    });
  } catch (err) {
    console.error('Check-in error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── POST /api/admin/bookings/manual ──────────────────────────────────────────
// Manually create a verified booking (Box Office / Direct Sale)
router.post('/bookings/manual', async (req, res) => {
  try {
    const { name, email, phone, quantity, eventId } = req.body;
    if (!name || !email || !phone || !quantity) {
      return res.status(400).json({ error: 'Name, email, phone, and quantity are required' });
    }

    const qty = parseInt(quantity);
    const tickets = [];
    for (let i = 0; i < qty; i++) {
      tickets.push({
        ticketId: 'TKT-' + uuidv4().split('-')[0].toUpperCase() + (qty > 1 ? `-${i+1}` : ''),
        scanned: false,
      });
    }

    let finalEventId = eventId;
    if (!finalEventId) {
      const activeEvent = await Event.findOne({ status: 'Active' });
      if (!activeEvent) {
        return res.status(400).json({ error: 'No active event found. Please select or create an active event first.' });
      }
      finalEventId = activeEvent._id;
    }

    const booking = new Booking({
      eventId: finalEventId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      quantity: qty,
      utr: 'BOX_OFFICE_' + Date.now().toString().slice(-6),
      status: 'verified',
      tickets,
      ticketId: tickets[0].ticketId, // Principal ID
    });


    await booking.save();

    // ── Email Ticket ──────────────────────────────────────────────────────────
    try {
      const event = await Event.findById(finalEventId).lean();
      if (event) {
          const qrMap = {};
          for (const t of booking.tickets) {
            qrMap[t.ticketId] = await generateQR(t.ticketId);
          }
          const pdfBuffer = await generatePDF(booking, event, qrMap);
          await sendTicket(booking.email, pdfBuffer, booking.name, event.name);
      }
    } catch (mailErr) {
      console.error('Manual booking email failed:', mailErr);
    }

    res.status(201).json({ message: 'Manual booking created and ticket issued', booking });
  } catch (err) {
    console.error('Manual booking error:', err);
    res.status(400).json({ error: 'Manual issuance failed: ' + (err.message || 'Unknown Error') });
  }
});

// ── POST /api/admin/issue-ticket ──────────────────────────────────────────
// Generate a payment link for a customer
router.post('/issue-ticket', async (req, res) => {
  try {
    const { phone, quantity, name, email, source } = req.body;
    if (!phone) return res.status(400).json({ error: 'Phone number is required' });

    // 1. Find or Create User
    let user = await User.findOne({ phone: phone.trim() });
    if (!user) {
        user = await User.create({ 
            phone: phone.trim(), 
            name: name || 'Valued Guest', 
            email: email || `guest-${Date.now()}@tms.com`,
            password: uuidv4(), // random temp password
            isVerified: true
        });
    }

    // 2. Create initiated booking
    const qty = parseInt(quantity) || 1;
    let finalEventId = req.body.eventId;
    
    if (!finalEventId) {
      const activeEvent = await Event.findOne({ status: 'Active' });
      if (!activeEvent) {
        return res.status(400).json({ error: 'No active event found to issue ticket against.' });
      }
      finalEventId = activeEvent._id;
    }

    // Generate unique ticket IDs for the quantity
    const tickets = [];
    for (let i = 0; i < qty; i++) {
        tickets.push({
            ticketId: 'TKT-' + uuidv4().split('-')[0].toUpperCase() + (qty > 1 ? `-${i + 1}` : ''),
            scanned: false
        });
    }

    const booking = await Booking.create({
        eventId: finalEventId,
        userId: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        quantity: qty,
        status: 'initiated',
        source: source || 'Admin Manual',
        issuedByAdmin: true,
        tickets,
        ticketId: tickets[0].ticketId
    });

    // 3. Return payment link
    const paymentLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/pay/${finalEventId}?bookingId=${booking._id}`;

    res.json({ 
        message: 'Payment link generated', 
        paymentLink,
        bookingId: booking._id 
    });
  } catch (err) {
    console.error('Issue ticket error:', err);
    res.status(400).json({ error: 'Ticket issuance failed: ' + (err.message || 'Check attendee details') });
  }
});

// ── DELETE /api/admin/bookings/:id ──────────────────────────────────────────
router.delete('/bookings/:id', async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    
    // If it was verified, potentially update payment to 'unused'
    if (booking.utr) {
      await Payment.updateOne({ utr: booking.utr }, { used: false });
    }
    
    res.json({ message: 'Booking deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ── PATCH /api/admin/bookings/:id ──────────────────────────────────────────
router.patch('/bookings/:id', async (req, res) => {
  try {
    const { name, phone, email, quantity } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    if (name) booking.name = name.trim();
    if (phone) booking.phone = phone.trim();
    if (email) booking.email = email.trim();
    if (quantity) booking.quantity = parseInt(quantity);

    await booking.save();
    res.json({ message: 'Booking updated', booking });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ── DELETE /api/admin/payments/:id ──────────────────────────────────────────
router.delete('/payments/:id', async (req, res) => {
  try {
    await Payment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Payment record deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ── PATCH /api/admin/payments/:id ──────────────────────────────────────────
router.patch('/payments/:id', async (req, res) => {
  try {
    const { utr, amount, used } = req.body;
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    if (utr) payment.utr = utr.toString().trim().toUpperCase();
    if (amount) payment.amount = parseFloat(amount);
    if (used !== undefined) payment.used = used === true || used === 'true';

    await payment.save();
    res.json({ message: 'Payment updated', payment });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ── POST /api/admin/sponsors/upload ──────────────────────────────────────────
router.post('/sponsors/upload', uploadSponsor.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file uploaded' });
  }
  const logoUrl = `/uploads/sponsors/${req.file.filename}`;
  res.json({ logoUrl });
});

/**
 * POST /api/admin/media/upload
 * Generic media uploader for header images and background videos
 */
router.post('/media/upload', (req, res, next) => {
    uploadMedia.single('file')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
          return res.status(400).json({ error: `Multer error: ${err.message}` });
        } else if (err) {
          return res.status(400).json({ error: err.message });
        }
        if (!req.file) return res.status(400).json({ error: 'No file identified' });
        
        const relativePath = `/uploads/media/${req.file.filename}`;
        res.json({ url: relativePath });
    });
});




module.exports = router;
