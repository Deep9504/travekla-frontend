const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
  from: String,
  to: String,
  date: Date,
  description: String,
  price: Number,
  capacity: Number,
  image: String,

  // 👤 CREATOR
  creator: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    avatar: String
  },

  // 👥 MEMBERSHIP CONTROL
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Approved members
  pendingMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Waiting for approval

  // 🛡️ ADMIN CONTROL
  isVerified: { type: Boolean, default: false }, // Admin must approve this trip?

  // 💰 EXPENSES (Existing)
  expenses: [{
    title: String,
    amount: Number,
    paidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    splitAmong: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    date: { type: Date, default: Date.now }
  }],
  // 📸 1. GALLERY (New)
  gallery: [{
    url: String, // We will store Image Links for now
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: { type: Date, default: Date.now }
  }],

  // ⭐ 2. REVIEWS (New)
  reviews: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, required: true },
    comment: String,
    date: { type: Date, default: Date.now }
  }],

  // 💬 3. GROUP CHAT (New)
  chat: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: String,
    date: { type: Date, default: Date.now }
  }],

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Group', GroupSchema);