const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Group = require('../models/Group');

// 1. GET DASHBOARD STATS (Revenue, Pending Counts)
router.get('/stats', async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const groupCount = await Group.countDocuments();
    
    // Count Pending items
    const pendingKYC = await User.countDocuments({ kycStatus: 'pending' });
    const pendingTrips = await Group.countDocuments({ isVerified: false });

    // Calculate Revenue (Fake calculation based on verified trips for now)
    // In real app, you would sum up a 'payments' collection
    const revenue = groupCount * 49; // Assuming ₹49 fee per trip

    res.json({
      revenue,
      users: userCount,
      pendingKYC,
      pendingTrips
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. GET PENDING KYC REQUESTS
router.get('/kyc-pending', async (req, res) => {
  try {
    // Find users who have uploaded a doc but aren't verified yet
    // For MVP, we assume anyone with 'pending' status
    const users = await User.find({ kycStatus: 'pending' }).select('name email kycStatus');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. APPROVE / REJECT KYC
router.put('/kyc-action', async (req, res) => {
  const { userId, action } = req.body; // action = 'approve' or 'reject'
  try {
    const status = action === 'approve' ? 'verified' : 'rejected';
    await User.findByIdAndUpdate(userId, { kycStatus: status });
    res.json({ success: true, status });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. GET PENDING TRIPS
router.get('/trips-pending', async (req, res) => {
  try {
    const trips = await Group.find({ isVerified: false })
      .populate('creator.id', 'name email');
    res.json(trips);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 5. VERIFY TRIP
router.put('/trip-verify/:id', async (req, res) => {
  try {
    await Group.findByIdAndUpdate(req.params.id, { isVerified: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;