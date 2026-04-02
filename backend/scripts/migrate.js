/**
 * Database Migration Script: Multi-Event Transition
 * 
 * Logic:
 * 1. Find the first existing event in the database.
 * 2. Update all existing bookings to reference this event.
 * 3. Assign a default slug to the existing event if missing.
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Event = require('../models/Event');
const Booking = require('../models/Booking');

async function migrate() {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/event-ticketing';
        await mongoose.connect(mongoURI);
        console.log('✅ Connected to MongoDB for migration');

        // 1. Find the primary event
        const primaryEvent = await Event.findOne({});
        if (!primaryEvent) {
            console.log('⚠️ No events found in database. Nothing to migrate.');
            process.exit(0);
        }

        console.log(`🎫 Found Primary Event: "${primaryEvent.name}" (${primaryEvent._id})`);

        // 2. Assign a slug if it doesn't have one
        if (!primaryEvent.slug) {
            primaryEvent.slug = 'bhajan-jamming-exp-3';
            primaryEvent.isFeatured = true;
            await primaryEvent.save();
            console.log(`✨ Assigned slug: "${primaryEvent.slug}" to the primary event.`);
        }

        // 3. Update all bookings that don't have an eventId
        const result = await Booking.updateMany(
            { eventId: { $exists: false } },
            { $set: { eventId: primaryEvent._id } }
        );

        console.log(`✅ Migration Complete! Updated ${result.modifiedCount} bookings to reference "${primaryEvent.name}".`);
        
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    }
}

migrate();
