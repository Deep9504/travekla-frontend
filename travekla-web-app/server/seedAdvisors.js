const mongoose = require('mongoose');
const Advisor = require('./models/Advisor');
require('dotenv').config();

const sampleAdvisors = [
  {
    name: "Rohan Das",
    specialty: "Himalayan Trekking",
    location: "Manali, HP",
    rating: 4.9,
    reviews: 120,
    price: 499,
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    bio: "Certified mountaineer with 10 years of experience leading groups in Himachal.",
    contact: "rohan@travekla.com"
  },
  {
    name: "Ananya Iyer",
    specialty: "Solo Female Travel",
    location: "Mumbai, MH",
    rating: 5.0,
    reviews: 85,
    price: 799,
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    bio: "Helping women travel solo safely and confidently across India.",
    contact: "ananya@travekla.com"
  },
  {
    name: "Vikram Singh",
    specialty: "Road Trips & Biking",
    location: "Ladakh",
    rating: 4.7,
    reviews: 200,
    price: 299,
    image: "https://randomuser.me/api/portraits/men/85.jpg",
    bio: "Expert in Ladakh bike circuits and off-road adventures.",
    contact: "vikram@travekla.com"
  }
];

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Connected to DB...");
    await Advisor.deleteMany({}); // Clear old data
    await Advisor.insertMany(sampleAdvisors);
    console.log("✅ Advisors Added Successfully!");
    process.exit();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });