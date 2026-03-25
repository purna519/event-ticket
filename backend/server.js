// ─── server.js ────────────────────────────────────────────────────────────────
// Main Express application entry point
// Connects to MongoDB, seeds default admin and event, registers all routes
// ──────────────────────────────────────────────────────────────────────────────

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.json());

// ─── CORS ───────────────────────────────────────────────────────────────────
app.use(cors());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user/auth', require('./routes/userAuth'));
app.use('/api/events', require('./routes/events'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/admin', require('./routes/admin'));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// ─── Test Email Connectivity (TEMPORARY) ──────────────────────────────────────
app.get('/api/test-email-send', async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: 'Email query param required' });
  
  const { sendOTP } = require('./utils/emailService');
  console.log(`[DEBUG] Attempting test email to ${email}...`);
  const result = await sendOTP(email, '123456', 'Test User');
  
  if (result === true) {
    res.json({ message: 'Email sent successfully via Brevo/Resend!' });
  } else {
    res.status(500).json({ error: 'Email failed', details: result });
  }
});

// ─── MongoDB Connection ────────────────────────────────────────────────────────
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/event-ticketing';
console.log(`📡 Attempting to connect to: ${mongoURI.split('@').length > 1 ? 'Remote MongoDB Atlas' : 'Local MongoDB (localhost)'}`);

mongoose
  .connect(mongoURI)
  .then(async () => {
    console.log('✅ MongoDB connected');
    await seedAdminAndEvent();
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// ─── Seed Default Admin & Event ───────────────────────────────────────────────
async function seedAdminAndEvent() {
  const Admin = require('./models/Admin');
  const Event = require('./models/Event');
  const bcrypt = require('bcryptjs');

  // Create admin if none exists
  const existingAdmin = await Admin.findOne({});
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(
      process.env.ADMIN_PASSWORD || 'admin123',
      10
    );
    await Admin.create({
      username: process.env.ADMIN_USERNAME || 'admin',
      passwordHash,
    });
    console.log(
      `👤 Default admin created: ${process.env.ADMIN_USERNAME || 'admin'} / ${process.env.ADMIN_PASSWORD || 'admin123'}`
    );
  }

  // Create or update event
  let event = await Event.findOne({});
  const eventData = {
    name: process.env.EVENT_NAME || 'The Music Society - Bhajan Jamming Experience',
    date: process.env.EVENT_DATE || '2026-03-26',
    time: process.env.EVENT_TIME || '5:30 PM - 9:30 PM',
    venue: process.env.EVENT_VENUE || 'Dinkit Pickleball Court, Gurunanak Colony',
    description:
      process.env.EVENT_DESCRIPTION ||
      'Sri Rama Navami Special. Episode 3. Join the Jam.',
    price: parseInt(process.env.TICKET_PRICE || '499'),
    upiId: process.env.UPI_ID || 'q840550651@ybl',
    upiName: process.env.UPI_NAME || 'The Music Society',
    upiNote: process.env.UPI_NOTE || 'BhajanJamTicket',
  };

  if (!event) {
    await Event.create(eventData);
    console.log('🎫 Default event created');
  } else {
    // Force update UPI details if they don't match the environment
    if (event.upiId !== eventData.upiId) {
      Object.assign(event, eventData);
      await event.save();
      console.log('🎫 Event UPI details updated from environment');
    }
  }
}
