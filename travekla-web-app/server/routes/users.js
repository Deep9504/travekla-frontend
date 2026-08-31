const router = require('express').Router();
const User = require('../models/User');

// 👇 1. APPLY TO BE AN ADVISOR (Existing Route)
router.put('/apply-advisor/:id', async (req, res) => {
  try {
    const { socialLink, about } = req.body;

    const user = await User.findByIdAndUpdate(req.params.id, {
      kycStatus: 'pending',        
      socialMediaLink: socialLink, 
      bio: about                   
    }, { new: true });

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 👇 2. GET USER DETAILS (Existing Route)
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        
        const { password, ...otherDetails } = user._doc; // Don't send password
        res.status(200).json(otherDetails);
    } catch (err) {
        res.status(500).json(err);
    }
});

// 👇 3. UPDATE USER PROFILE (🌟 NEW ROUTE ADDED HERE)
router.put('/:id', async (req, res) => {
  try {
    // Safety: If avatar string is empty, don't overwrite the existing one
    if (req.body.avatar === "") delete req.body.avatar;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body }, // Update whatever is sent (name, location, bio, avatar)
      { new: true }       // Return the updated document
    );

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    // Remove password before sending back
    const { password, ...otherDetails } = updatedUser._doc;
    
    res.status(200).json(otherDetails);
  } catch (err) {
    res.status(500).json(err);
  }
});
// 👇 4. DELETE USER (Add this to server/routes/users.js)
router.delete('/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "User has been deleted." });
  } catch (err) {
    res.status(500).json(err);
  }
});
// 👇 GET ALL USERS (For Admin Dashboard)
router.get('/', async (req, res) => {
  try {
    const users = await User.find(); // Fetch everyone
    res.json(users);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;