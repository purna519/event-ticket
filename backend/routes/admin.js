// ─── routes/admin.js ──────────────────────────────────────────────────────────
// JWT-protected admin panel routes:
//   - GET  /stats             : Dashboard statistics
//   - GET  /payments          : List payment records
//   - POST /payments/upload   : CSV bulk upload
//   - POST /payments/manual   : Single manual payment entry
//   - GET  /bookings          : List all bookings
//   - PATCH /bookings/:id/approve : Manually approve a booking
//   - PATCH /bookings/:id/reject  : Manually reject a booking
//   - PUT  /event             : Update event details
// ──────────────────────────────────────────────────────────────────────────────

const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const { generateQR, generatePDF } = require('../utils/ticketGenerator');
const { decrypt, encrypt } = require('../utils/encryption');
const { sendTicket } = require('../utils/emailService');
const authMiddleware = require('../middleware/auth');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const Event = require('../models/Event');

// ── Multer: store CSVs in /uploads/csv/ ──────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads', 'csv');
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `payments-${Date.now()}.csv`);
  },
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
});

// ── Multer: store Sponsor Logos in /uploads/sponsors/ ───────────────────────
const sponsorStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads', 'sponsors');
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `sponsor-${Date.now()}${ext}`);
  },
});
const uploadSponsor = multer({
  storage: sponsorStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB max
});

// Apply JWT middleware to ALL admin routes
router.use(authMiddleware);

// ── GET /api/admin/stats ──────────────────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const [totalBookings, verified, pending, rejected, totalPayments, usedPayments] =
      await Promise.all([
        Booking.countDocuments(),
        Booking.countDocuments({ status: 'verified' }),
        Booking.countDocuments({ status: 'pending' }),
        Booking.countDocuments({ status: 'rejected' }),
        Payment.countDocuments(),
        Payment.countDocuments({ used: true }),
      ]);

    // Aggregate ticket volume and attendance
    const verifiedBookings = await Booking.find({ status: 'verified' }).lean();
    let totalTickets = 0;
    let scannedTickets = 0;
    
    verifiedBookings.forEach(b => {
      totalTickets += b.quantity || 1;
      if (b.tickets) {
        scannedTickets += b.tickets.filter(t => t.scanned).length;
      } else if (b.status === 'verified') {
        // Fallback for old data if any
        if (b.scanned) scannedTickets++; 
      }
    });

    res.json({
      totalBookings,
      verified,
      pending,
      rejected,
      totalPayments,
      usedPayments,
      unusedPayments: totalPayments - usedPayments,
      totalTickets,
      scannedTickets,
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── GET /api/admin/payments ───────────────────────────────────────────────────
router.get('/payments', async (req, res) => {
  try {
    const payments = await Payment.find({})
      .sort({ createdAt: -1 })
      .lean();
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ── POST /api/admin/payments/upload ──────────────────────────────────────────
// Upload a CSV with columns: UTR, Amount, Date
// Rows with duplicate UTRs are skipped gracefully
router.post('/payments/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No CSV file uploaded' });
  }

  const results = [];
  const errors = [];
  let inserted = 0;
  let skipped = 0;

  await new Promise((resolve, reject) => {
    fs.createReadStream(req.file.path)
      .pipe(csv({ mapHeaders: ({ header }) => header.trim().toLowerCase() }))
      .on('data', (row) => results.push(row))
      .on('end', resolve)
      .on('error', reject);
  });

  // Process each row from CSV
  for (const row of results) {
    const utr = (row['utr'] || row['transaction id'] || row['txn id'] || '').toString().trim().toUpperCase();
    const amount = parseFloat(row['amount'] || row['amt'] || 0);
    const timestamp = row['date'] || row['timestamp'] ? new Date(row['date'] || row['timestamp']) : new Date();

    if (!utr || isNaN(amount) || amount <= 0) {
      errors.push(`Skipped invalid row: ${JSON.stringify(row)}`);
      skipped++;
      continue;
    }

    try {
      await Payment.create({ utr, amount, timestamp });
      inserted++;
    } catch (dbErr) {
      // Duplicate UTR — skip silently
      if (dbErr.code === 11000) {
        skipped++;
      } else {
        errors.push(`Row "${utr}": ${dbErr.message}`);
        skipped++;
      }
    }
  }

  // Clean up uploaded file
  fs.unlink(req.file.path, () => {});

  res.json({
    message: `CSV processed: ${inserted} inserted, ${skipped} skipped`,
    inserted,
    skipped,
    errors: errors.slice(0, 10), // cap error list
  });
});

// ── POST /api/admin/payments/manual ──────────────────────────────────────────
// Manually add a single payment record
router.post('/payments/manual', async (req, res) => {
  try {
    const { utr, amount, date } = req.body;
    if (!utr || !amount) {
      return res.status(400).json({ error: 'UTR and amount are required' });
    }

    const payment = await Payment.create({
      utr: utr.toString().trim().toUpperCase(),
      amount: parseFloat(amount),
      timestamp: date ? new Date(date) : new Date(),
    });

    res.status(201).json({ message: 'Payment record added', payment });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'UTR already exists' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// ── GET /api/admin/bookings ───────────────────────────────────────────────────
router.get('/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .sort({ createdAt: -1 })
      .lean();
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ── PATCH /api/admin/bookings/:id/approve ─────────────────────────────────────
// Manually approve a pending booking and generate ticket
router.patch('/bookings/:id/approve', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    // Generate multi-tickets if not already present
    if (!booking.tickets || booking.tickets.length === 0) {
      const qty = booking.quantity || 1;
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
      const Payment = require('../models/Payment');
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
// Update event details
router.put('/event', async (req, res) => {
  try {
    const { name, date, time, venue, locationUrl, description, price, upiId, upiName, upiNote, supportNumber, benefits, sponsors } = req.body;
    const event = await Event.findOne({});
    if (!event) return res.status(404).json({ error: 'No event found' });

    Object.assign(event, {
      ...(name && { name }),
      ...(date && { date }),
      ...(time && { time }),
      ...(venue && { venue }),
      ...(locationUrl !== undefined && { locationUrl }),
      ...(description !== undefined && { description }),
      ...(price && { price: parseFloat(price) }),
      ...(upiId && { upiId }),
      ...(upiName && { upiName }),
      ...(upiNote && { upiNote }),
      ...(supportNumber && { supportNumber }),
      ...(benefits !== undefined && { benefits }),
      ...(sponsors !== undefined && { sponsors }),
    });
    await event.save();

    res.json({ message: 'Event updated', event });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ── POST /api/admin/verify-ticket ─────────────────────────────────────────────
// Verify a single ticket ID and mark as scanned
router.post('/verify-ticket', async (req, res) => {
  try {
    const { ticketId } = req.body;
    if (!ticketId) return res.status(400).json({ error: 'Ticket ID is required' });

    // Find the booking that contains this ticketId
    const booking = await Booking.findOne({ 'tickets.ticketId': ticketId });
    if (!booking) return res.status(404).json({ error: 'Invalid Ticket ID' });

    // Find the specific ticket in the array
    const ticketIndex = booking.tickets.findIndex(t => t.ticketId === ticketId);
    const ticket = booking.tickets[ticketIndex];

    if (ticket.scanned) {
      return res.status(400).json({ 
        error: 'Ticket already scanned', 
        scannedAt: ticket.scannedAt,
        holder: booking.name 
      });
    }

    // Mark as scanned
    booking.tickets[ticketIndex].scanned = true;
    booking.tickets[ticketIndex].scannedAt = new Date();
    await booking.save();

    res.json({
      message: 'Access Granted',
      holder: booking.name,
      ticketId: ticket.ticketId,
      quantity: booking.quantity,
      scannedAt: booking.tickets[ticketIndex].scannedAt
    });
  } catch (err) {
    console.error('Verify ticket error:', err);
    res.status(500).json({ error: 'Server error' });
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


// ── USER MANAGEMENT ROUTES ──────────────────────────────────────────────────

/**
 * GET /api/admin/users
 * Search and list registered users
 */
router.get('/users', async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
        ]
      };
    }
    const users = await User.find(query).sort({ createdAt: -1 }).lean();
    
    // Decrypt passwords for admin support
    const enrichedUsers = users.map(u => ({
      ...u,
      supportPassword: decrypt(u.encryptedPassword)
    }));
    res.json(enrichedUsers);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * POST /api/admin/users
 * Manually create a user
 */
router.post('/users', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    const user = new User({ 
      name, 
      email, 
      phone, 
      password, 
      encryptedPassword: encrypt(password),
      isVerified: true 
    });
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * PUT /api/admin/users/:id
 * Update user details
 */
router.put('/users/:id', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    if (password) {
      user.password = password;
      user.encryptedPassword = encrypt(password);
    }

    await user.save();
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * PATCH /api/admin/users/:id/verify
 * Manually verify or unverify a user
 */
router.patch('/users/:id/verify', async (req, res) => {
  try {
    const { isVerified } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.isVerified = isVerified;
    if (isVerified) {
      user.otp = undefined;
      user.otpExpires = undefined;
    }
    await user.save();
    res.json({ message: `User ${isVerified ? 'verified' : 'unverified'} successfully`, user });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * DELETE /api/admin/users/:id
 * Remove a user
 */
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
