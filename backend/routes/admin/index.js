const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/auth');

// Apply JWT auth once to all admin routes
router.use(authMiddleware);

// Modular sub-routers
router.use('/', require('./statsRoutes'));
router.use('/', require('./eventRoutes'));
router.use('/', require('./promoRoutes'));
router.use('/', require('./financeRoutes'));
router.use('/', require('./bookingRoutes'));
router.use('/', require('./userRoutes'));

module.exports = router;
