const mongoose = require('mongoose');
require('dotenv').config();

const EventSchema = new mongoose.Schema({
  name: String,
  date: String,
  time: String,
  venue: String,
  description: String,
  price: Number,
  upiId: String,
  upiName: String,
  upiNote: String,
});

const Event = mongoose.model('Event', EventSchema);

async function updateEvent() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/event-ticketing';
    console.log('Connecting to', mongoUri);
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const update = {
      name: 'Bhajan',
      upiName: 'The Music Society',
      description: 'The devotional jamming experience. Sri Rama Navami Special. Episode 3. Join the Jam.',
      date: '2026-03-26',
      time: '5:30 PM - 9:30 PM',
      venue: 'Dinkit Pickleball Court, Gurunanak Colony'
    };

    const result = await Event.findOneAndUpdate({}, update, { new: true, upsert: true });
    console.log('Event updated:', result);

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('Update failed:', err);
    process.exit(1);
  }
}

updateEvent();
