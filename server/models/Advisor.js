const mongoose = require('mongoose');

const AdvisorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialty: { type: String, required: true }, // e.g., "Trekking", "Luxury"
  location: String,
  rating: { type: Number, default: 5.0 },
  reviews: { type: Number, default: 0 },
  price: { type: Number, required: true }, // Price per consultation
  image: String, // URL to avatar
  bio: String,
  contact: String, // Email or Phone
  isVerified: { type: Boolean, default: true }
});

module.exports = mongoose.model('Advisor', AdvisorSchema);