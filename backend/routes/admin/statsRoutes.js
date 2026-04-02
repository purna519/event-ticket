const express = require('express');
const router = express.Router();
const Booking = require('../../models/Booking');
const Payment = require('../../models/Payment');
const Event = require('../../models/Event');
const User = require('../../models/User');

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const { eventId } = req.query;
    const filter = eventId ? { eventId } : {};

    const [event, totalBookings, verified, pending, rejected, totalPayments, usedPayments] =
      await Promise.all([
        Event.findById(eventId || null).lean(),
        Booking.countDocuments(filter),
        Booking.countDocuments({ ...filter, status: 'verified' }),
        Booking.countDocuments({ ...filter, status: 'pending' }),
        Booking.countDocuments({ ...filter, status: 'rejected' }),
        Payment.countDocuments(),
        Payment.countDocuments({ used: true }),
      ]);

    const allReserved = await Booking.find({ ...filter, status: { $in: ['verified', 'pending', 'initiated'] } }).select('quantity tickets status');
    const reservedTickets = allReserved.reduce((sum, b) => sum + (b.quantity || 1), 0);
    const verifiedBookings = allReserved.filter(b => b.status === 'verified');
    const totalTickets = verifiedBookings.reduce((sum, b) => sum + (b.quantity || 1), 0);
    let scannedTickets = 0;
    allReserved.forEach(b => { if (b.tickets) scannedTickets += b.tickets.filter(t => t.scanned).length; });

    const totalCapacity = event?.totalCapacity || 150;
    const totalRevenue = totalTickets * (event?.price || 499);

    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    const dailyStats = await Booking.aggregate([
      { $match: { ...filter, createdAt: { $gte: fourteenDaysAgo }, status: { $in: ['verified', 'pending'] } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: '$quantity' } } },
      { $sort: { _id: 1 } }
    ]);

    let genderStats;
    if (eventId) {
      const userIds = await Booking.find({ eventId }).distinct('userId');
      genderStats = await User.aggregate([{ $match: { _id: { $in: userIds } } }, { $group: { _id: '$gender', count: { $sum: 1 } } }]);
    } else {
      genderStats = await User.aggregate([{ $group: { _id: '$gender', count: { $sum: 1 } } }]);
    }

    const sourceStats = await Booking.aggregate([
      { $match: filter },
      { $group: { _id: '$source', count: { $sum: 1 } } }
    ]);

    res.json({ totalBookings, verified, pending, rejected, totalPayments, usedPayments, unusedPayments: totalPayments - usedPayments, totalTickets, scannedTickets, totalCapacity, reservedTickets, totalRevenue, dailyStats, genderStats, sourceStats });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
