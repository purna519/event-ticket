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
const PromoCode = require('../models/PromoCode');
const { generateQR, generatePDF } = require('../utils/ticketGenerator');
const { v4: uuidv4 } = require('uuid');
const userAuth = require('../middleware/userAuth');

// ── POS /api/bookings/promo/validate ──────────────────────────────────────────
router.post('/promo/validate', userAuth, async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'Promo code is required' });

    const promo = await PromoCode.findOne({ code: code.toUpperCase(), isActive: true });
    if (!promo) return res.status(404).json({ error: 'Invalid or inactive promo code' });

    // 1. Check Expiry
    if (promo.expiryDate && new Date(promo.expiryDate) < new Date()) {
      return res.status(400).json({ error: 'Promo code has expired' });
    }

    // 2. Check Global Usage Limit
    if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
      return res.status(400).json({ error: 'Promo code usage limit reached' });
    }

    // 3. Check Per-User Limit
    if (promo.maxUsagePerUser) {
      const userUsageCount = await Booking.countDocuments({ 
        userId: req.user.id, 
        promoCode: code.toUpperCase(),
        status: { $ne: 'rejected' } 
      });
      
      if (userUsageCount >= promo.maxUsagePerUser) {
        return res.status(400).json({ error: `You have already used this promo code ${userUsageCount} time(s).` });
      }
    }

    res.json({
        message: 'Promo code applied successfully',
        discountType: promo.discountType,
        discountValue: promo.discountValue
    });
  } catch (err) {
    console.error('Promo validation error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── POST /api/bookings/initiate ───────────────────────────────────────────────
// Create a new booking with an automatically generated Reference ID (UTR)
router.post('/initiate', userAuth, async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { eventId, quantity, promoCode } = req.body;
    if (!eventId) return res.status(400).json({ error: 'eventId is required' });

    const event = await Event.findById(eventId).lean();
    if (!event) return res.status(404).json({ error: 'Event not found' });

    // Generate unique 12-digit numeric Reference ID (Identity Signature)
    const autoUtr = Math.floor(Math.random() * 900000000000 + 100000000000).toString();

    // Generate unique ticket IDs
    const requestedQty = parseInt(quantity) || 1;
    const tickets = [];
    for (let i = 0; i < requestedQty; i++) {
        tickets.push({
            ticketId: 'TKT-' + uuidv4().split('-')[0].toUpperCase() + (requestedQty > 1 ? `-${i + 1}` : ''),
            scanned: false
        });
    }

    const booking = await Booking.create({
      userId: user._id,
      eventId: event._id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      quantity: requestedQty,
      utr: autoUtr, 
      status: 'pending', // Directly move to pending for admin verification
      ticketId: tickets[0].ticketId,
      tickets,
      promoCode: promoCode ? promoCode.toUpperCase() : null
    });

    res.status(201).json({ message: 'Booking initiated with Ref: ' + autoUtr, id: booking._id, utr: autoUtr });
  } catch (err) {
    console.error('Initiate booking error:', err);
    res.status(500).json({ error: 'System error during booking initiation' });
  }
});


// ── GET /api/bookings/latest ────────────────────────────────────────────────
// Get the most recent single booking for the user
router.get('/latest', userAuth, async (req, res) => {
  try {
    const booking = await Booking.findOne({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .populate('eventId');
    if (!booking) return res.status(404).json({ error: 'No transmissions found' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

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
    // Get user details
    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Check Capacity
    const { eventId, quantity, promoCode } = req.body;
    if (!eventId) return res.status(400).json({ error: 'eventId is required' });

    const event = await Event.findById(eventId).lean();
    if (!event) return res.status(404).json({ error: 'Event not found' });
    const capacity = event.totalCapacity || 150;

    // Check if event date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(event.date);
    if (eventDate < today) {
        return res.status(403).json({ error: 'This event has already taken place. Booking is closed.' });
    }

    const allBookingsForEvent = await Booking.find({ 
        eventId: event._id, 
        status: { $in: ['verified', 'pending'] } 
    }).lean();

    const totalReserved = allBookingsForEvent.reduce((sum, b) => sum + (b.quantity || 1), 0);
    const requestedQty = parseInt(quantity) || 1;
    
    if (totalReserved + requestedQty > capacity) {
      return res.status(403).json({ error: 'Event Capacity Reached' });
    }

    // Generate unique ticket IDs for the quantity
    const tickets = [];
    for (let i = 0; i < requestedQty; i++) {
        tickets.push({
            ticketId: 'TKT-' + uuidv4().split('-')[0].toUpperCase() + (requestedQty > 1 ? `-${i + 1}` : ''),
            scanned: false
        });
    }

    const booking = await Booking.create({
      userId: user._id,
      eventId: event._id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      quantity: requestedQty,
      status: 'initiated',
      ticketId: tickets[0].ticketId,
      tickets,
      promoCode: promoCode ? promoCode.toUpperCase() : null
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

    const event = await Event.findById(booking.eventId).lean();
    if (!event) return res.status(404).json({ error: 'Event not found' });

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
    const { eventId } = req.query;
    if (!eventId) return res.status(400).json({ error: 'eventId query param required' });

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    
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
