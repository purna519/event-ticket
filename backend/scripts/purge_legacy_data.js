/**
 * purge_legacy_data.js
 * 
 * ERASES completely: Events, Bookings, Reviews, Payments, PromoCodes
 * PROTECTS: Users, Admins
 * 
 * Usage: Insert live Atlas URI into your .env, then run:
 * node purge_legacy_data.js --confirm
 */

require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');

// Models
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const Payment = require('../models/Payment');
const PromoCode = require('../models/PromoCode');

const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
    console.error("❌ MONGODB_URI is not set in your .env file.");
    process.exit(1);
}

const args = process.argv.slice(2);
if (!args.includes('--confirm')) {
    console.warn("⚠️ WARNING: This will PERMANENTLY ERASE legacy events and bookings from the target database.");
    console.warn("⚠️ The Users and Admins collections will be safely preserved.");
    console.warn("");
    console.warn("To execute on your LIVE Atlas database, run:");
    console.warn("node purge_legacy_data.js --confirm");
    process.exit(1);
}

async function purgeDatabase() {
    try {
        console.log(`📡 Connecting to MongoDB: ${MONGO_URI.split('@').length > 1 ? 'Remote MongoDB Atlas' : 'Local MongoDB'}`);
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected successfully.\n');

        console.log('🗑️ Aggressively purging legacy production records...');

        const eRes = await Event.deleteMany({});
        console.log(`- Dropped ${eRes.deletedCount} Event records.`);

        const bRes = await Booking.deleteMany({});
        console.log(`- Dropped ${bRes.deletedCount} Booking records.`);

        const rRes = await Review.deleteMany({});
        console.log(`- Dropped ${rRes.deletedCount} Review records.`);

        const pRes = await Payment.deleteMany({});
        console.log(`- Dropped ${pRes.deletedCount} Payment records.`);

        const pcRes = await PromoCode.deleteMany({});
        console.log(`- Dropped ${pcRes.deletedCount} PromoCode records.`);

        console.log('\n👑 Legacy User and Admin records were completely preserved (0 deleted).');
        console.log('\n✅ Database purge sequence completed successfully. Ready for deployment!');
        
        await mongoose.disconnect();
        process.exit(0);

    } catch (err) {
        console.error('❌ FATAL ERROR during purge:', err);
        process.exit(1);
    }
}

purgeDatabase();
