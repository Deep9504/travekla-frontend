const express = require('express');
const router = express.Router();
const Advisor = require('../models/Advisor');

// 1. GET ALL ADVISORS
router.get('/', async (req, res) => {
  try {
    const advisors = await Advisor.find();
    res.json(advisors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. ADD A NEW ADVISOR (For Admin use)
router.post('/', async (req, res) => {
  try {
    const newAdvisor = new Advisor(req.body);
    const savedAdvisor = await newAdvisor.save();
    res.status(201).json(savedAdvisor);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;