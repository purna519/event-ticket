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

/**
 * GET /api/admin/users/export
 * Export all users as a CSV file
 */
router.get('/users/export', async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 }).lean();
    
    let csv = 'Name,Email,Phone,Verified,Created At\n';
    users.forEach(u => {
      csv += `"${u.name}","${u.email}","${u.phone}",${u.isVerified},"${u.createdAt.toISOString()}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=music-society-members.csv');
    res.status(200).send(csv);
  } catch (err) {
    res.status(500).json({ error: 'Export failed' });
  }
});



module.exports = router;
