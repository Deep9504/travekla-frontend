const mongoose = require("mongoose");

const ExpenseSchema = new mongoose.Schema({
  tripId: { type: String, required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  paidBy: { type: String, required: true }, // Name of the person who paid
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Expense", ExpenseSchema);