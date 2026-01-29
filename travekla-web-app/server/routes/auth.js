const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
require('dotenv').config();

// Initialize Google Client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || "23833065398-4q440fffi4g2mhk9rdapgau2ociubfbu.apps.googleusercontent.com");

// ==========================================
// 1. AUTHENTICATION ROUTES
// ==========================================

// REGISTER
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name,
      email,
      password: hashedPassword,
      role: role === 'advisor' ? 'advisor' : 'traveler', 
      kycStatus: 'new'
    });

    await user.save();
    
    const payload = { user: { id: user.id, role: user.role } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar } });
    });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid Credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid Credentials' });

    const payload = { user: { id: user.id, role: user.role } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
      if (err) throw err;
      res.json({ success: true, token, user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, kycStatus: user.kycStatus || 'new', isVerified: user.isVerified } });
    });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// GOOGLE LOGIN
router.post('/google', async (req, res) => {
  const { token } = req.body;
  try {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID || "23833065398-4q440fffi4g2mhk9rdapgau2ociubfbu.apps.googleusercontent.com",
    });
    
    const { name, email, picture } = ticket.getPayload();
    let user = await User.findOne({ email });

    if (user) {
        // Login existing
        const payload = { user: { id: user.id, role: user.role } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
            if (err) throw err;
            res.json({ success: true, token, user });
        });
    } else {
        // Register new
        const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(randomPassword, salt);

        user = new User({
            name,
            email,
            password: hashedPassword,
            avatar: picture,
            role: 'traveler',
            kycStatus: 'new'
        });

        await user.save();
        const payload = { user: { id: user.id, role: user.role } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
            if (err) throw err;
            res.json({ success: true, token, user });
        });
    }
  } catch (err) {
    console.error("Google Auth Error:", err);
    res.status(500).json({ message: "Google Sign-In Failed" });
  }
});

// GET SINGLE USER
router.get('/user/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ==========================================
// 2. ADVISOR & VERIFICATION ROUTES
// ==========================================

// GET ALL ADVISORS (With Sorting Logic: Verified First)
router.get('/advisors', async (req, res) => {
  try {
    const advisors = await User.find({ role: 'advisor' })
      .select('-password -kycDocument')
      // 🌟 SORT: Verified First (-1), Then by most advice given (-1)
      .sort({ isVerified: -1, adviceCount: -1 }); 
    res.json(advisors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// SWITCH ROLE (Traveler <-> Advisor)
router.put('/switch-role', async (req, res) => {
    const { userId, role } = req.body;
    try {
        const user = await User.findByIdAndUpdate(userId, { role }, { new: true });
        res.json({ success: true, user });
    } catch(err) {
        res.status(500).json({ message: err.message });
    }
});

// SUBMIT KYC (Step 1) - Corrected Duplicate
router.put('/submit-kyc', async (req, res) => {
  const { userId, documentUrl } = req.body;
  try {
    // ⚠️ STATUS IS 'pending' (Strict Mode)
    const user = await User.findByIdAndUpdate(userId, { 
        kycStatus: 'pending', 
        kycDocument: documentUrl 
    }, { new: true }).select('-password');
    
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// VERIFY ADVISOR (Step 2 & 3: Check URL + Payment + KYC Status)
router.put('/verify-advisor', async (req, res) => {
  const { userId, socialLink, paymentSuccess } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // 1. Strict Check: KYC must be verified first
    if (user.kycStatus !== 'verified') {
        return res.json({ success: false, message: "KYC must be verified first!" });
    }

    // 2. Strict Check: Social URL Validation
    const validDomains = ['instagram.com', 'linkedin.com', 'youtube.com', 'facebook.com', 'x.com'];
    const isValidLink = validDomains.some(domain => socialLink.toLowerCase().includes(domain));
    
    if (!isValidLink) {
        return res.json({ success: false, message: "Invalid Social URL. We only accept Instagram, LinkedIn, or YouTube." });
    }

    // 3. Strict Check: Payment
    if (!paymentSuccess) {
        return res.json({ success: false, message: "Monthly subscription payment required." });
    }

    // ✅ All Checks Passed -> Grant Blue Tick
    user.isVerified = true;
    user.socialMediaLink = socialLink;
    user.verificationRequestDate = Date.now();
    
    await user.save();
    
    res.json({ success: true, user, message: "Verification Successful! You are now a Verified Advisor." });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// 3. ADMIN ROUTES (Optional: if not using admin.js)
// ==========================================
// (It is better to keep these in admin.js, but if you want them here for simplicity, here they are)

// GET PENDING KYC REQUESTS
router.get('/admin/pending-kyc', async (req, res) => {
    try {
        const users = await User.find({ kycStatus: 'pending' });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// APPROVE / REJECT KYC
router.put('/admin/verify-kyc', async (req, res) => {
    const { userId, action } = req.body; // action = 'approve' or 'reject'
    try {
        const status = action === 'approve' ? 'verified' : 'rejected';
        const user = await User.findByIdAndUpdate(userId, { kycStatus: status }, { new: true });
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
// 👇 SECRET ROUTE: Run this once to make yourself an Admin 👇
// router.get('/make-admin/:email', async (req, res) => {
//   try {
//     const user = await User.findOneAndUpdate(
//       { email: req.params.email },
//       { role: 'admin' },
//       { new: true }
//     );
//     if (!user) return res.json({ message: "User not found!" });
//     res.json({ success: true, message: `${user.name} is now an ADMIN! 👮‍♂️`, user });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

module.exports = router;