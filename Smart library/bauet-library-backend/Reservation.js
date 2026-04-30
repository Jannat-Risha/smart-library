const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema({
  userId: String,
  bookId: String,
  date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    default: "Pending"
  }
});

module.exports = mongoose.model("Reservation", reservationSchema);