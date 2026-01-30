const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bookingRoutes = require('./routes/bookings');
require('dotenv').config();
const adminRoutes = require('./routes/admin');
const tripRoutes = require('./routes/trips');
const adminRoute = require('./routes/admin');
const userRoute = require('./routes/users');
const paymentRoute = require('./routes/payments');
const groupRoute = require('./routes/groups');

const app = express();

// --- MIDDLEWARE ---
app.use(cors({
  origin: '*',
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());

// --- ROUTES ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/groups', require('./routes/groups'));
app.use('/api/advisors', require('./routes/advisors')); // Ensure this file exists
app.use('/api/ai', require('./routes/ai'));             // Ensure this file exists
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/admin', adminRoute);
app.use('/api/users', userRoute);
app.use('/api/payments', paymentRoute);
app.use('/api/trips', groupRoute);  // For fetching trip details
app.use('/api/group', groupRoute);

// 👇👇 ADD THIS NEW LINE FOR ADMIN 👇👇
app.use('/api/admin', require('./routes/admin'));
// ------------------------------------------------

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully!"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

app.get('/', (req, res) => {
  res.send('Travekla Backend is Running!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});