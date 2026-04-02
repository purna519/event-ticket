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

// ── PROMO CODE ROUTES ────────────────────────────────────────────────────────

router.get('/promos', async (req, res) => {
  try {
    const promos = await PromoCode.find().sort({ createdAt: -1 });
    res.json(promos);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/promos', async (req, res) => {
  try {
    const { code, discountType, discountValue, usageLimit, maxUsagePerUser, expiryDate } = req.body;
    const promo = await PromoCode.create({ code, discountType, discountValue, usageLimit, maxUsagePerUser, expiryDate });
    res.status(201).json(promo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.patch('/promos/:id', async (req, res) => {
  try {
    const { isActive, usageLimit, maxUsagePerUser, expiryDate } = req.body;
    const promo = await PromoCode.findByIdAndUpdate(req.params.id, { isActive, usageLimit, maxUsagePerUser, expiryDate }, { new: true });
    res.json(promo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/promos/:id', async (req, res) => {
  try {
    await PromoCode.findByIdAndDelete(req.params.id);
    res.json({ message: 'Promo code deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});



module.exports = router;
