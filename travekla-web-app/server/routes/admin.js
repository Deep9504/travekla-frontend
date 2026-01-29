const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Trip = require('../models/Trip');

// 1. GET DASHBOARD STATS (Revenue, Counts)
router.get('/stats', async (req, res) => {
  try {
    const pendingKYC = await User.countDocuments({ kycStatus: 'pending' });
    const pendingTrips = await Trip.countDocuments({ isVerified: false });

    // Calculate Estimated Revenue (Advisors * ₹499)
    const advisorCount = await User.countDocuments({ role: 'advisor' });
    const revenue = advisorCount * 499; 

    res.json({ revenue, pendingKYC, pendingTrips });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. GET PENDING KYC REQUESTS
router.get('/kyc-pending', async (req, res) => {
  try {
    const users = await User.find({ kycStatus: 'pending' });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. GET PENDING TRIPS
router.get('/trips-pending', async (req, res) => {
  try {
    const trips = await Trip.find({ isVerified: false })
      .populate('creator', 'name email'); 
    res.json(trips);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. HANDLE KYC ACTION (Approve/Reject) -- 🌟 UPDATED SECTION 🌟
router.put('/kyc-action', async (req, res) => {
  const { userId, action } = req.body; // action will be 'approve' or 'reject'
  
  try {
    const status = action === 'approve' ? 'verified' : 'rejected';
    const isVerified = action === 'approve'; // true if approved, false if rejected

    // Update BOTH kycStatus and isVerified (Blue Tick)
    const user = await User.findByIdAndUpdate(userId, { 
        kycStatus: status,
        isVerified: isVerified 
    }, { new: true });
    
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 5. VERIFY TRIP (Publish it)
router.put('/trip-verify/:id', async (req, res) => {
  try {
    const trip = await Trip.findByIdAndUpdate(req.params.id, { isVerified: true }, { new: true });
    
    if (!trip) return res.status(404).json({ message: "Trip not found" });

    res.json({ success: true, trip });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;