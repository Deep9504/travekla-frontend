const mongoose = require('mongoose');

const TripSchema = new mongoose.Schema({
  // --- 1. BASIC TRIP INFO ---
  from: { type: String, required: true },
  to: { type: String, required: true },
  date: { type: Date, required: true },
  budget: { type: Number, required: true },
  description: { type: String },
  capacity: { type: Number, default: 10 },
  type: { type: String, enum: ['guided_tour', 'personal_plan'], default: 'personal_plan' },
  isVerified: { type: Boolean, default: false },

  // --- 2. PEOPLE ---
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Confirmed Travelers
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], 
  
  // Waiting List (Renamed to match your Routes)
  pendingMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  // --- 3. FEATURES (The missing parts!) ---
  
  // 💰 Expenses (For Split Bill)
  expenses: [{
    title: String,
    amount: Number,
    paidBy: String,
    date: { type: Date, default: Date.now }
  }],

  // 📸 Gallery (For Photos)
  gallery: [{
    url: String,
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],

  // 📅 Itinerary
  itinerary: [{ 
    day: Number, 
    activity: String 
  }],

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Trip', TripSchema);