const router = require('express').Router();
const User = require('../models/User');

// 👇 1. APPLY TO BE AN ADVISOR (The Route You Need)
// Frontend calls: axios.put('/api/users/apply-advisor/:id', ...)
router.put('/apply-advisor/:id', async (req, res) => {
  try {
    const { socialLink, about } = req.body;

    // Update the user to "pending" so they show up in your Admin Dashboard
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

// 👇 2. GET USER DETAILS (Useful for Profile Page later)
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        const { password, ...otherDetails } = user._doc; // Don't send password
        res.status(200).json(otherDetails);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;