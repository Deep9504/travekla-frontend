const express = require('express');
const router = express.Router();
const Trip = require('../models/Trip');
const User = require('../models/User'); 

// ==========================================
// 1. CREATE TRIP (Hybrid Logic)
// ==========================================
router.post('/create', async (req, res) => {
  const { from, to, date, budget, description, creatorId } = req.body;
  
  try {
    const user = await User.findById(creatorId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // LOGIC: Advisors need approval. Travelers do not.
    const shouldVerify = user.role !== 'advisor'; 

    const newTrip = new Trip({
      from, 
      to, 
      date, 
      budget, 
      description,
      creator: creatorId,
      isVerified: shouldVerify, 
      type: user.role === 'advisor' ? 'guided_tour' : 'personal_plan',
      members: [], 
      joinRequests: [], // Initialize empty waiting list
      itinerary: [] 
    });

    await newTrip.save();
    res.json({ success: true, trip: newTrip });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// 2. GET ALL TRIPS (Global Feed - UNFILTERED)
// ==========================================
router.get('/', async (req, res) => {
    try {
      const { search } = req.query;
      
      // 🚨 FIX: Removed "{ isVerified: true }"
      // Now it will return ALL trips, even unverified ones.
      let query = {}; 
  
      if (search) {
        query.$or = [
          { from: { $regex: search, $options: 'i' } },
          { to: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }
  
      const trips = await Trip.find(query)
        .populate('creator', 'name avatar role isVerified')
        .populate('members', 'name avatar email') 
        .populate('joinRequests', 'name avatar email')
        .sort({ createdAt: -1 });
  
      // 🔍 Debug: Print how many trips found to the terminal
      console.log(`📡 GET /api/trips found ${trips.length} trips`);

      res.json(trips);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
});

// ==========================================
// 3. GET MY TRIPS (For Dashboard)
// ==========================================
router.get('/my-trips/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const trips = await Trip.find({ creator: userId })
        .populate('members', 'name email avatar') 
        .populate('joinRequests', 'name email avatar') // Populate requests here too
        .sort({ createdAt: -1 });
      res.json(trips);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
});

// ==========================================
// 4. REQUEST TO JOIN (Debug & Crash-Proof Version)
// ==========================================
router.post('/:id/join', async (req, res) => {
  console.log("-----------------------------------------");
  console.log("📡 JOIN REQUEST RECEIVED");
  console.log("Trip ID:", req.params.id);
  console.log("User ID:", req.body.userId);

  try {
    const { userId } = req.body; 
    
    // 1. Find the trip
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
        console.log("❌ Trip not found in DB");
        return res.status(404).json({ message: "Trip not found" });
    }

    console.log("✅ Trip Found:", trip.to);

    // 🛡️ FIX FOR OLD TRIPS: If joinRequests doesn't exist, create it!
    if (!trip.joinRequests) {
        console.log("⚠️ Old Trip detected (Missing joinRequests). Initializing array...");
        trip.joinRequests = [];
    }
    if (!trip.members) {
        trip.members = [];
    }

    // 2. Check if user is ALREADY a member
    // Using loose equality (==) to handle String vs ObjectId comparison automatically
    const isMember = trip.members.some(m => m == userId);
    if (isMember) {
        console.log("🚫 User is already a MEMBER");
        return res.status(400).json({ message: "You are already a member!" });
    }

    // 3. Check if user already REQUESTED
    const isRequested = trip.joinRequests.some(r => r == userId);
    if (isRequested) {
        console.log("🚫 User already REQUESTED");
        return res.status(400).json({ message: "Request already sent! Please wait." });
    }

    // 4. Add to WAITING LIST
    trip.joinRequests.push(userId);
    await trip.save();

    console.log("🎉 SUCCESS: User added to Waiting List");
    console.log("New Request Count:", trip.joinRequests.length);
    console.log("-----------------------------------------");

    res.json({ success: true, message: "Request sent to organizer!" });

  } catch (err) {
    console.error("💥 SERVER CRASH IN JOIN ROUTE:", err);
    res.status(500).json({ message: "Server Error: " + err.message });
  }
});

// ==========================================
// 5. UPDATE TRIP (For Manage Page)
// ==========================================
router.put('/:id', async (req, res) => {
  try {
    const trip = await Trip.findByIdAndUpdate(
      req.params.id, 
      { $set: req.body }, 
      { new: true } 
    );
    res.json(trip);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// 6. ACCEPT / REJECT REQUESTS (New!)
// ==========================================

// ACCEPT: Move from Requests -> Members
router.post('/:id/request/accept', async (req, res) => {
    try {
        const { userId } = req.body;
        const trip = await Trip.findById(req.params.id);
        
        if (!trip) return res.status(404).json({ message: "Trip not found" });

        // 1. Remove from JoinRequests
        trip.joinRequests = trip.joinRequests.filter(id => id && id.toString() !== userId);
        
        // 2. Add to Members (Prevent duplicates)
        if (!trip.members.some(m => m && m.toString() === userId)) {
            trip.members.push(userId);
        }
        
        await trip.save();
        res.json({ success: true, trip });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// REJECT: Remove from Requests Only
router.post('/:id/request/reject', async (req, res) => {
    try {
        const { userId } = req.body;
        const trip = await Trip.findById(req.params.id);

        if (!trip) return res.status(404).json({ message: "Trip not found" });
        
        // 1. Remove from JoinRequests
        trip.joinRequests = trip.joinRequests.filter(id => id && id.toString() !== userId);
        
        await trip.save();
        res.json({ success: true, trip });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
// ==========================================
// 7. DELETE TRIP (Admin or Creator Only)
// ==========================================
router.delete('/:id', async (req, res) => {
  try {
    const trip = await Trip.findByIdAndDelete(req.params.id);
    if (!trip) return res.status(404).json({ message: "Trip not found" });
    res.json({ success: true, message: "Trip deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// ==========================================
// 8. GET TRIPS I JOINED OR REQUESTED
// ==========================================
router.get('/booked-trips/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        // Find trips where user is in 'members' OR 'joinRequests'
        const trips = await Trip.find({
            $or: [
                { members: userId },
                { joinRequests: userId }
            ]
        })
        .populate('creator', 'name avatar email') // Need creator info to show who hosts it
        .sort({ date: 1 }); // Sort by upcoming date
        
        res.json(trips);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;