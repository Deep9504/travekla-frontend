const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  traveler: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // The user sending request
  advisor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // The expert being hired
  message: { type: String, required: true },
  preferredDate: { type: Date },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', BookingSchema);