const express = require('express');
const router = express.Router();
const Group = require('../models/Group');

// --- 1. GET ALL GROUPS (With Search!) ---
router.get('/', async (req, res) => {
  try {
    const { search } = req.query; 
    let query = {};

    // If there is a search term, filter by 'to' (Destination) or 'from' (Start)
    if (search) {
      query = {
        $or: [
          { to: { $regex: search, $options: 'i' } },   // 'i' means case-insensitive
          { from: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const groups = await Group.find(query).sort({ createdAt: -1 }).populate('creator.id', 'name avatar');
    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- 2. CREATE A NEW TRIP ---
router.post('/', async (req, res) => {
  try {
    const newGroup = new Group(req.body);
    const savedGroup = await newGroup.save();
    res.status(201).json(savedGroup);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// --- 3. JOIN A GROUP ---
router.put('/:id/join', async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    const userId = req.body.userId; 

    if (group.members.includes(userId) || group.pendingMembers.includes(userId)) {
      return res.status(400).json({ message: "You have already joined or requested!" });
    }

    group.pendingMembers.push(userId);
    await group.save();

    res.json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}); // 👈 THIS WAS MISSING IN YOUR CODE

// --- 4. APPROVE MEMBER ---
router.put('/:id/approve', async (req, res) => {
  const { userId } = req.body;
  try {
    const group = await Group.findById(req.params.id);
    
    // Move from Pending to Members
    group.pendingMembers = group.pendingMembers.filter(id => id.toString() !== userId);
    group.members.push(userId);
    
    group.membersJoined = group.members.length + 1; 

    await group.save();
    res.json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- 5. REMOVE / REJECT MEMBER ---
router.put('/:id/remove', async (req, res) => {
  const { userId } = req.body;
  try {
    const group = await Group.findById(req.params.id);

    group.members = group.members.filter(id => id.toString() !== userId);
    group.pendingMembers = group.pendingMembers.filter(id => id.toString() !== userId);
    
    group.membersJoined = Math.max(1, group.members.length + 1);

    await group.save();
    res.json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- 6. ADD EXPENSE TO GROUP ---
router.put('/:id/expense', async (req, res) => {
  const { title, amount, payerId } = req.body;
  try {
    const group = await Group.findById(req.params.id);
    
    if (!group) return res.status(404).json({ message: "Group not found" });

    const newExpense = {
      title,
      amount: Number(amount),
      paidBy: payerId,
      splitAmong: group.members, 
      date: new Date()
    };

    group.expenses.push(newExpense);
    await group.save();

    res.json(group);
  } catch (err) {
    console.error("Expense Error:", err);
    res.status(500).json({ message: err.message });
  }
});
// 7. UPLOAD PHOTO TO GALLERY
router.put('/:id/gallery', async (req, res) => {
  const { userId, photoUrl } = req.body;
  try {
    const group = await Group.findById(req.params.id);
    if (!group.members.includes(userId)) return res.status(403).json({ message: "Only members can upload" });

    group.gallery.push({ url: photoUrl, uploadedBy: userId });
    await group.save();
    
    // Return populated group so UI updates instantly
    const updatedGroup = await Group.findById(req.params.id)
      .populate('gallery.uploadedBy', 'name avatar')
      .populate('chat.user', 'name avatar')
      .populate('reviews.user', 'name avatar');
      
    res.json(updatedGroup);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 8. ADD REVIEW
router.post('/:id/reviews', async (req, res) => {
  const { userId, rating, comment } = req.body;
  try {
    const group = await Group.findById(req.params.id);
    
    // Check if already reviewed
    const alreadyReviewed = group.reviews.find(r => r.user.toString() === userId);
    if (alreadyReviewed) return res.status(400).json({ message: "You already reviewed this trip" });

    group.reviews.push({ user: userId, rating, comment });
    await group.save();
    
    const updatedGroup = await Group.findById(req.params.id).populate('reviews.user', 'name avatar');
    res.json(updatedGroup);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 9. SEND CHAT MESSAGE
router.post('/:id/chat', async (req, res) => {
  const { userId, message } = req.body;
  try {
    const group = await Group.findById(req.params.id);
    
    // Security: Only members/creator can chat
    const isMember = group.members.includes(userId);
    const isCreator = group.creator.id.toString() === userId;
    
    if (!isMember && !isCreator) {
        return res.status(403).json({ message: "Join group to chat" });
    }

    group.chat.push({ user: userId, message });
    await group.save();
    
    // Return only the last message to save bandwidth, or full group? 
    // For MVP, returning full populated group ensures sync.
    const updatedGroup = await Group.findById(req.params.id)
        .populate('chat.user', 'name avatar');
        
    res.json(updatedGroup);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 👇 ALSO UPDATE YOUR "GET /:id" ROUTE to populate these new fields!
// Find the existing router.get('/:id', ...) and update the .populate() part:
router.get('/:id', async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('creator.id', 'name avatar')
      .populate('members', 'name avatar email') // Populate members for list
      .populate('gallery.uploadedBy', 'name avatar') // NEW
      .populate('reviews.user', 'name avatar') // NEW
      .populate('chat.user', 'name avatar'); // NEW

    if (!group) return res.status(404).json({ message: 'Group not found' });
    res.json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;