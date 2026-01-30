const express = require('express');
const router = express.Router();
// 👇 We use the Trip model, but call it 'Group' for consistency
const Group = require('../models/Trip');

// --- 1. GET ALL TRIPS (With Search) ---
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
        .populate('creator', 'name avatar'); // ✅ FIXED: Removed '.id'
        
    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- 2. GET SINGLE TRIP (Populated) ---
router.get('/:id', async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('creator', 'name avatar') // ✅ FIXED: Removed '.id'
      .populate('members', 'name avatar email')
      .populate('pendingMembers', 'name avatar email')
      .populate('gallery.uploadedBy', 'name avatar');

    if (!group) return res.status(404).json({ message: 'Trip not found' });
    res.json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- 3. CREATE A NEW TRIP (🛡️ DEFENSIVE FIX) ---
// Changed to '/create' to be explicit and safe
router.post('/create', async (req, res) => {
  try {
    console.log("📝 Receiving Trip Data:", req.body); 

    // ✅ FIX: Catch 'creatorId' from frontend and map it to 'creator'
    const userId = req.body.creatorId || req.body.creator;

    if (!userId) {
      console.error("❌ Error: User ID is missing!");
      return res.status(400).json({ message: "User ID is required." });
    }

    const newGroup = new Group({
      ...req.body,
      creator: userId // ✅ Explicitly linking the creator
    });

    const savedGroup = await newGroup.save();
    console.log("✅ Trip Saved:", savedGroup._id);
    res.status(201).json(savedGroup);

  } catch (err) {
    console.error("❌ Create Error:", err);
    res.status(400).json({ message: err.message });
  }
});

// --- 4. JOIN A TRIP ---
router.post('/:id/join', async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    const { userId } = req.body;

    if (group.members.includes(userId) || group.pendingMembers.includes(userId)) {
      return res.status(400).json({ message: "Already joined or requested!" });
    }

    group.pendingMembers.push(userId);
    await group.save();

    res.json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- 5. GET EXPENSES ---
router.get('/:id/expenses', async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);
        if (!group) return res.status(404).json({ message: "Trip not found" });
        res.json(group.expenses || []);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- 6. ADD EXPENSE ---
router.post('/:id/expenses', async (req, res) => {
  const { description, amount, paidBy } = req.body;
  try {
    const group = await Group.findById(req.params.id);
    
    const newExpense = {
      title: description,
      amount: Number(amount),
      paidBy: paidBy,
      date: new Date()
    };

    group.expenses.push(newExpense);
    await group.save();

    res.json(group.expenses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- 7. UPLOAD PHOTO ---
router.post('/:id/photos', async (req, res) => {
  const { photoUrl, userId } = req.body; // Expect userId if possible
  try {
    const group = await Group.findById(req.params.id);
    
    // Push object for better structure
    group.gallery.push({ url: photoUrl, uploadedBy: userId }); 
    
    await group.save();
    res.json(group.gallery);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;