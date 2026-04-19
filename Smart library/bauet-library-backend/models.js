const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema({
  userId: String,
  bookId: String,
  issueDate: {
    type: Date,
    default: Date.now
  },
  dueDate: Date,
  returned: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model("Issue", issueSchema);