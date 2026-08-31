const express = require('express');
const router = express.Router();

// We don't need the real AI library for this mock version
// const { GoogleGenerativeAI } = require("@google/generative-ai");

router.post('/generate-trip', async (req, res) => {
  const { prompt } = req.body;
  
  console.log(`Received prompt: ${prompt}`);
  console.log("⚠️ API Quota exceeded. Using MOCK response.");

  // SIMULATE AI THINKING TIME (1 second)
  await new Promise(resolve => setTimeout(resolve, 1000));

  // HARDCODED "AI" RESPONSE
  // You can change these values to test different scenarios
  const mockTrip = {
    from: "Mumbai",
    to: "Goa",
    description: `(AI Generated) A fantastic trip based on your request: "${prompt}". Expect sunny beaches, great seafood, and a relaxed vibe. Perfect for a quick getaway!`,
    price: 7500,
    capacity: 12,
    date: "2025-12-25"
  };

  res.json(mockTrip);
});

module.exports = router;