const mongoose = require('mongoose');

const TripSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  date: { type: Date, required: true },
  budget: { type: Number, required: true },
  description: { type: String },
  type: { type: String, enum: ['guided_tour', 'personal_plan'], default: 'personal_plan' },
  isVerified: { type: Boolean, default: false },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // 🔗 RELATIONSHIPS
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // 👇 IMPORTANT: This was likely missing!
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], 
  

  // 🌟 NEW: WAITING LIST (Add this line!)
  joinRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  // 👇 ALSO ADD THIS (For the Itinerary Builder)
  itinerary: [{ 
    day: Number, 
    activity: String 
  }],

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Trip', TripSchema);