const express = require('express');
const router = express.Router();
const Group = require('../models/Group'); // Make sure you have the Group Model created too!

// --- 1. GET ALL TRIPS (For Home Page) ---
router.get('/', async (req, res) => {
  try {
    // Fetch all groups, sort by newest first
    const groups = await Group.find().sort({ createdAt: -1 });
    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- 2. CREATE A NEW TRIP (For Create Group Page) ---
router.post('/', async (req, res) => {
  try {
    const newGroup = new Group(req.body);
    const savedGroup = await newGroup.save();
    res.status(201).json(savedGroup);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// --- 3. JOIN A GROUP (Updated) ---
router.put('/:id/join', async (req, res) => {
  try {
    const { userId } = req.body; // We will send the User ID from frontend
    const group = await Group.findById(req.params.id);
    
    if (!group) return res.status(404).json({ message: "Group not found" });

    // Check if full
    if (group.members.length >= group.capacity) {
      return res.status(400).json({ message: "Group is full!" });
    }

    // Check if user already joined
    if (group.members.includes(userId)) {
      return res.status(400).json({ message: "You already joined this trip!" });
    }

    // Add User to List
    group.members.push(userId);
    group.membersJoined = group.members.length; // Keep the counter in sync

    await group.save();

    // Populate user details so frontend can show names immediately
    // (This replaces the ID with the actual Name/Avatar of the user)
    const populatedGroup = await group.populate('members', 'name avatar');

    res.json(populatedGroup); 
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
  // --- 4. GET TRIPS BY CREATOR (My Created Trips) ---
router.get('/user/:id', async (req, res) => {
  try {
    const groups = await Group.find({ 'creator.id': req.params.id }).sort({ createdAt: -1 });
    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- 5. GET TRIPS JOINED BY USER ---
router.get('/joined/:id', async (req, res) => {
  try {
    // Find groups where the 'members' array contains this User ID
    const groups = await Group.find({ members: req.params.id }).sort({ createdAt: -1 });
    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
});
module.exports = router;