const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');

// 1. CREATE A HIRE REQUEST
router.post('/', async (req, res) => {
  const { travelerId, advisorId, message, date } = req.body;
  
  try {
    const newBooking = new Booking({
      traveler: travelerId,
      advisor: advisorId,
      message,
      preferredDate: date
    });

    const savedBooking = await newBooking.save();
    res.json({ success: true, booking: savedBooking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. GET REQUESTS FOR AN ADVISOR (So they can see who wants to hire them)
router.get('/advisor/:advisorId', async (req, res) => {
  try {
    const requests = await Booking.find({ advisor: req.params.advisorId })
      .populate('traveler', 'name email avatar'); // Show details of the person hiring
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;