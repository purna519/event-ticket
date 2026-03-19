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
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

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

// ─── MongoDB Connection ────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/event-ticketing')
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

  // Create event if none exists
  const existingEvent = await Event.findOne({});
  if (!existingEvent) {
    await Event.create({
      name: process.env.EVENT_NAME || 'The Music Society - Bhajan Jamming Experience',
      date: process.env.EVENT_DATE || '2026-03-26',
      time: process.env.EVENT_TIME || '5:30 PM - 9:30 PM',
      venue: process.env.EVENT_VENUE || 'Dinkit Pickleball Court, Gurunanak Colony',
      description:
        process.env.EVENT_DESCRIPTION ||
        'Sri Rama Navami Special. Episode 3. Join the Jam.',
      price: parseInt(process.env.TICKET_PRICE || '499'),
      upiId: process.env.UPI_ID || 'yourname@upi',
      upiName: process.env.UPI_NAME || 'The Music Society',
      upiNote: process.env.UPI_NOTE || 'BhajanJamTicket',
    });
    console.log('🎫 Default event created');
  }
}
