const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  date: { type: String, required: true },
  description: { type: String },
  price: { type: Number, default: 0 },
  capacity: { type: Number, default: 10 },
  
  // 👇 OLD WAY (Simple Counter) - We keep it for safety for now
  membersJoined: { type: Number, default: 1 }, 
  
  // 👇 NEW WAY (List of People)
  members: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' // Links to the User collection
  }],
  
  gallery: [String],
  creator: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    avatar: String
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Group', GroupSchema);