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



module.exports = router;
