// ─── routes/bookings.js ───────────────────────────────────────────────────────
// Core user-facing booking routes:
//   - POST /submit      : UTR submission + automatic verification
//   - GET /status/:id   : Poll booking status
//   - GET /ticket/:id   : Download PDF ticket
//   - GET /qr/:id       : Get QR code image
// ──────────────────────────────────────────────────────────────────────────────

const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Event = require('../models/Event');
const { generateQR, generatePDF } = require('../utils/ticketGenerator');
const { v4: uuidv4 } = require('uuid');
const userAuth = require('../middleware/userAuth');

// ── GET /api/bookings/my ──────────────────────────────────────────────────────
// List all bookings for the authenticated user
router.get('/my', userAuth, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ── POST /api/bookings/initiate ───────────────────────────────────────────────
// Create a pending booking after user clicks "Paid"
router.post('/initiate', userAuth, async (req, res) => {
  try {
    const { quantity } = req.body;
    
    // Get user details
    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Check Capacity (150 Tickets Limit)
    const allBookings = await Booking.find({ status: { $in: ['verified', 'pending'] } }).lean();
    const totalReserved = allBookings.reduce((sum, b) => sum + (b.quantity || 1), 0);
    const requestedQty = parseInt(quantity) || 1;
    
    if (totalReserved + requestedQty > 150) {
      return res.status(403).json({ error: 'Event Capacity Reached' });
    }

    // Generate unique ticket ID for reference
    const primaryTicketId = 'TKT-' + uuidv4().split('-')[0].toUpperCase();
    const generatedUtr = Math.floor(100000000000 + Math.random() * 900000000000).toString();
    const tickets = [{
        ticketId: primaryTicketId,
        scanned: false
    }];

    const booking = await Booking.create({
      userId: user._id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      quantity: requestedQty,
      status: 'pending',
      ticketId: primaryTicketId,
      utr: generatedUtr,
      tickets,
    });

    res.status(201).json({ message: 'Booking initiated', id: booking._id });
  } catch (err) {
    console.error('Initiate booking error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── GET /api/bookings/status/:id ──────────────────────────────────────────────
router.get('/status/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).lean();
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ── GET /api/bookings/ticket/:id ──────────────────────────────────────────────
// Stream PDF ticket for download (only for verified bookings)
router.get('/ticket/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).lean();
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.status !== 'verified') {
      return res.status(400).json({ error: 'Ticket only available for verified bookings' });
    }

    const event = await Event.findOne({}).lean();
    if (!event) return res.status(500).json({ error: 'Event not configured' });

    // Generate QRs for all tickets then PDF
    const tickets = booking.tickets && booking.tickets.length > 0
      ? booking.tickets
      : [{ ticketId: booking.ticketId }];

    const qrMap = {};
    for (const t of tickets) {
      const qrData = `UTR:${booking.utr || 'N/A'}|TKT:${t.ticketId}|QTY:${booking.quantity}`;
      qrMap[t.ticketId] = await generateQR(qrData);
    }
    
    const pdfBuffer = await generatePDF(booking, event, qrMap);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="ticket-${booking.ticketId}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });
    res.send(pdfBuffer);
  } catch (err) {
    console.error('Ticket generation error:', err);
    res.status(500).json({ error: 'Could not generate ticket' });
  }
});

// ── GET /api/bookings/qr/:id ──────────────────────────────────────────────────
// Return QR code as base64 data URI for display in browser
router.get('/qr/:ticketId', async (req, res) => {
  try {
    const { ticketId } = req.params;
    const booking = await Booking.findOne({ 'tickets.ticketId': ticketId }).lean();
    if (!booking) return res.status(404).json({ error: 'Ticket not found' });
    if (booking.status !== 'verified') {
      return res.status(400).json({ error: 'QR only available for verified bookings' });
    }

    const qrData = `UTR:${booking.utr || 'N/A'}|TKT:${ticketId}|QTY:${booking.quantity}`;
    const qrDataUri = await generateQR(qrData);
    res.json({ qr: qrDataUri, ticketId });
  } catch (err) {
    console.error('QR generation error:', err);
    res.status(500).json({ error: 'Could not generate QR' });
  }
});

// ── GET /api/bookings/payment-qr ──────────────────────────────────────────────
// Generate a QR code for the UPI payment link (used for desktop users)
router.get('/payment-qr', async (req, res) => {
  try {
    const event = await Event.findOne({});
    if (!event) return res.status(500).json({ error: 'Event not configured' });
    
    const amount = req.query.amount || event.price;
    const upiLink = `upi://pay?pa=${event.upiId}&pn=${encodeURIComponent(event.upiName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(event.upiNote || 'Event Ticket')}`;
    
    const qrDataUri = await generateQR(upiLink);
    res.json({ qr: qrDataUri, upiLink });
  } catch (err) {
    console.error('Payment QR generation error:', err);
    res.status(500).json({ error: 'Could not generate payment QR' });
  }
});

module.exports = router;
