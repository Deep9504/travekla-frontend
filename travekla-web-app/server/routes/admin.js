const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Trip = require('../models/Trip');

// 1. GET DASHBOARD STATS (Revenue, Counts)
// Frontend calls: fetch('http://localhost:5000/api/admin/stats')
router.get('/stats', async (req, res) => {
  try {
    // Count pending KYCs
    const pendingKYC = await User.countDocuments({ kycStatus: 'pending' });

    // Count pending Trips (isVerified: false)
    const pendingTrips = await Trip.countDocuments({ isVerified: false });

    // Calculate Estimated Revenue 
    // Logic: Count Advisors -> Multiply by ₹499 (Simulation)
    const advisorCount = await User.countDocuments({ role: 'advisor' });
    const revenue = advisorCount * 499; 

    res.json({ revenue, pendingKYC, pendingTrips });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. GET PENDING KYC REQUESTS
// Frontend calls: fetch('http://localhost:5000/api/admin/kyc-pending')
router.get('/kyc-pending', async (req, res) => {
  try {
    // Find users waiting for approval
    const users = await User.find({ kycStatus: 'pending' });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. GET PENDING TRIPS
// Frontend calls: fetch('http://localhost:5000/api/admin/trips-pending')
router.get('/trips-pending', async (req, res) => {
  try {
    // Find trips that are NOT verified yet
    // .populate('creator') ensures we see WHO created the trip in the table
    const trips = await Trip.find({ isVerified: false })
      .populate('creator', 'name email'); 
    res.json(trips);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. HANDLE KYC ACTION (Approve/Reject)
// Frontend calls: fetch('http://localhost:5000/api/admin/kyc-action', method: 'PUT')
router.put('/kyc-action', async (req, res) => {
  const { userId, action } = req.body; // action will be 'approve' or 'reject'
  try {
    const status = action === 'approve' ? 'verified' : 'rejected';
    
    // Update the user's KYC status
    const user = await User.findByIdAndUpdate(userId, { kycStatus: status }, { new: true });
    
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 5. VERIFY TRIP (Publish it)
// Frontend calls: fetch(`http://localhost:5000/api/admin/trip-verify/${tripId}`, method: 'PUT')
router.put('/trip-verify/:id', async (req, res) => {
  try {
    // Set isVerified to true
    const trip = await Trip.findByIdAndUpdate(req.params.id, { isVerified: true }, { new: true });
    
    if (!trip) return res.status(404).json({ message: "Trip not found" });

    res.json({ success: true, trip });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;