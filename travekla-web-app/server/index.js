const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// --- IMPORT ROUTES ---
const authRoute = require('./routes/auth');
const userRoute = require('./routes/users');
const adminRoute = require('./routes/admin');
const paymentRoute = require('./routes/payments');
const bookingRoutes = require('./routes/bookings');
const advisorsRoute = require('./routes/advisors'); 
const aiRoute = require('./routes/ai');

// 👇 THIS IS THE WORKING FILE
const groupRoute = require('./routes/groups'); 

const app = express();

// --- MIDDLEWARE ---
app.use(cors({ origin: '*', methods: ["GET", "POST", "PUT", "DELETE"], credentials: true }));
app.use(express.json());

// --- ROUTES ---
app.use('/api/auth', authRoute);
app.use('/api/users', userRoute);
app.use('/api/admin', adminRoute);
app.use('/api/payments', paymentRoute);
app.use('/api/bookings', bookingRoutes);
app.use('/api/advisors', advisorsRoute);
app.use('/api/ai', aiRoute);

// 👇 THE FIX: Map ALL these names to the same working file
app.use('/api/trips', groupRoute);  // For "/trips"
app.use('/api/groups', groupRoute); // For "/groups" (The one in your screenshot!)
app.use('/api/group', groupRoute);  // For "/group"

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully!"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

app.get('/', (req, res) => res.send('Travekla Backend is Running!'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));