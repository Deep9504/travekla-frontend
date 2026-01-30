const express = require('express');
const router = express.Router();
// const Group = require('../models/Group');
const Group = require('../models/Trip');

// --- 1. GET ALL GROUPS (With Search!) ---
router.get('/', async (req, res) => {
  try {
    const { search } = req.query; 
    let query = {};

    if (search) {
      query = {
        $or: [
          { to: { $regex: search, $options: 'i' } }, 
          { from: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const groups = await Group.find(query)
        .sort({ createdAt: -1 })
        .populate('creator.id', 'name avatar');
        
    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- 2. GET SINGLE GROUP (Populated) ---
router.get('/:id', async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('creator.id', 'name avatar')
      .populate('members', 'name avatar email') 
      .populate('gallery.uploadedBy', 'name avatar') 
      .populate('reviews.user', 'name avatar') 
      .populate('chat.user', 'name avatar'); 

    if (!group) return res.status(404).json({ message: 'Group not found' });
    res.json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- 3. CREATE A NEW TRIP ---
router.post('/', async (req, res) => {
  try {
    const newGroup = new Group(req.body);
    const savedGroup = await newGroup.save();
    res.status(201).json(savedGroup);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// --- 4. JOIN A GROUP ---
// Changed to POST to match Frontend
router.post('/:id/join', async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    const { userId } = req.body; 

    // Check if user is already a member or pending
    if (group.members.includes(userId) || group.pendingMembers.includes(userId)) {
      return res.status(400).json({ message: "You have already joined or requested!" });
    }

    group.pendingMembers.push(userId);
    await group.save();

    res.json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- 5. GET EXPENSES (For the Bill Splitter) ---
router.get('/:id/expenses', async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);
        if (!group) return res.status(404).json({ message: "Group not found" });
        // Return the expenses array directly
        res.json(group.expenses || []);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- 6. ADD EXPENSE ---
// Changed to POST to match Frontend
router.post('/:id/expenses', async (req, res) => {
  const { description, amount, paidBy } = req.body; // Matches Frontend Input
  try {
    const group = await Group.findById(req.params.id);
    
    const newExpense = {
      title: description, // Mapping 'description' to 'title' in DB
      amount: Number(amount),
      paidBy: paidBy,
      date: new Date()
    };

    group.expenses.push(newExpense);
    await group.save();

    res.json(group.expenses); // Return updated expenses
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- 7. UPLOAD PHOTO TO GALLERY ---
// Changed to POST to match Frontend
router.post('/:id/photos', async (req, res) => {
  const { photoUrl } = req.body;
  try {
    const group = await Group.findById(req.params.id);
    
    // Simple push string URL (since Frontend sends just URL)
    // If your DB expects an object, change this line.
    // Assuming schema is: gallery: [String]
    group.gallery.push(photoUrl); 
    
    await group.save();
    res.json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;