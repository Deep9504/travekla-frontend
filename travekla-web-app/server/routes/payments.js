const router = require('express').Router();
const Razorpay = require('razorpay');

// 👇 PASTE YOUR KEYS HERE
const razorpay = new Razorpay({
  key_id: 'rzp_test_S9inWIWBAG8Kn0',    // 👈 Paste Key ID here
  key_secret: 'TQuDg78tab0tDvxwgj89M4Un'       // 👈 Paste Secret here
});

// 1. CREATE ORDER
router.post('/create-order', async (req, res) => {
  try {
    const options = {
      amount: 499 * 100, // ₹499 (Amount in paise)
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.log("Error creating order:", error);
    res.status(500).send("Error creating order");
  }
});

module.exports = router;