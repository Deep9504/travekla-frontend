const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library'); // 👈 Import Google Library
const User = require('../models/User');
require('dotenv').config();

// Initialize Google Client
// (For safety, we default to the ID you shared if env is missing)
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || "23833065398-4q440fffi4g2mhk9rdapgau2ociubfbu.apps.googleusercontent.com");

// --- 1. REGISTER USER ---
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
      role: role || 'traveler',
      kycStatus: 'new'
    });

    await user.save();

    const payload = { user: { id: user.id, role: user.role } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, kycStatus: user.kycStatus } });
    });
  } catch (err) {
    res.status(500).json({ message: 'Server Error: ' + err.message });
  }
});

// --- 2. LOGIN USER ---
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
      res.json({ success: true, token, user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, kycStatus: user.kycStatus || 'new' } });
    });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// --- 3. 🔥 GOOGLE LOGIN ROUTE (The Fix) ---
router.post('/google', async (req, res) => {
  const { token } = req.body;

  try {
    // A. Verify Token with Google
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: "23833065398-4q440fffi4g2mhk9rdapgau2ociubfbu.apps.googleusercontent.com",
    });
    
    const { name, email, picture } = ticket.getPayload();

    // B. Check if user exists
    let user = await User.findOne({ email });

    if (user) {
        // -> LOGIN EXISTING USER
        const payload = { user: { id: user.id, role: user.role } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
            if (err) throw err;
            res.json({ success: true, token, user });
        });
    } else {
        // -> REGISTER NEW USER (with dummy password)
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

// --- 4. SUBMIT KYC ---
router.put('/submit-kyc', async (req, res) => {
  const { userId, documentUrl } = req.body;
  try {
    const user = await User.findByIdAndUpdate(userId, { kycStatus: 'pending', kycDocument: documentUrl }, { new: true }).select('-password');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- 5. GET USER ---
router.get('/user/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// 7. GET ALL ADVISORS
router.get('/advisors', async (req, res) => {
  try {
    // Find users with role 'advisor'
    // We select only necessary fields to be safe
    const advisors = await User.find({ role: 'advisor' })
      .select('-password -kycDocument'); 
    res.json(advisors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;