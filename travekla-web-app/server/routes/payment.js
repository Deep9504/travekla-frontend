const router = require('express').Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/User');

// 👇 PASTE YOUR KEYS HERE
const razorpay = new Razorpay({
  key_id: 'rzp_test_SBZuldO5pJESYo',    // Paste your Key ID from Dashboard
  key_secret: 'Qne7tyvWl8E7l61PgwvQZT7D'          // Paste your Key Secret from Dashboard
});

// 1. CREATE ORDER (Frontend calls this first)
router.post('/orders', async (req, res) => {
  try {
    const options = {
      amount: 199 * 100, // Amount in paise (199 * 100 = ₹199)
      currency: "INR",
      receipt: "receipt_" + Math.random().toString(36).substring(7),
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error creating order");
  }
});

// 2. VERIFY PAYMENT (Razorpay calls this after success)
router.post('/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", 'Qne7tyvWl8E7l61PgwvQZT7D') // 👈 PASTE SECRET AGAIN HERE
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      // ✅ Payment Verified! Give the Blue Tick
      await User.findByIdAndUpdate(userId, { 
        isVerified: true,
        verificationRequestDate: new Date()
      });
      
      return res.json({ success: true, message: "Payment Verified" });
    } else {
      return res.status(400).json({ message: "Invalid Signature" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;