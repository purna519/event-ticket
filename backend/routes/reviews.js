const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const userAuth = require('../middleware/userAuth');

// @route   GET /api/reviews
// @desc    Get all approved public reviews
router.get('/', async (req, res) => {
    try {
        const reviews = await Review.find({ isApproved: true })
           .populate('user', 'name')
           .populate('event', 'name episodeNum')
           .sort({ createdAt: -1 })
           .limit(50);
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// @route   POST /api/reviews
// @desc    Submit a new verified review
router.post('/', userAuth, async (req, res) => {
    try {
        const { eventId, bookingId, rating, comment } = req.body;
        
        // Ensure booking belongs to this user
        const booking = await Booking.findOne({ _id: bookingId, user: req.user.id });
        if (!booking) return res.status(403).json({ msg: 'Unauthorized or booking not found.' });
        
        if (booking.status !== 'Verified' && booking.status !== 'Completed') {
            return res.status(400).json({ msg: 'You can only review an event after attending and verifying.' });
        }
        
        // Ensure not already reviewed
        const existing = await Review.findOne({ booking: bookingId, user: req.user.id });
        if (existing) return res.status(400).json({ msg: 'You have already reviewed this booking.' });

        const newReview = new Review({
            user: req.user.id,
            event: eventId,
            booking: bookingId,
            rating,
            comment
        });
        await newReview.save();
        
        res.status(201).json(newReview);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error saving review.' });
    }
});

module.exports = router;
