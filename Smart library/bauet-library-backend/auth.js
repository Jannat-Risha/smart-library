const express = require("express");
const router = express.Router();
const User = require("../models/User");

// LOGIN API (REAL)
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // DB থেকে user খোঁজা
    const user = await User.findOne({ username });

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    // password check
    if (user.password !== password) {
      return res.json({ success: false, message: "Wrong password" });
    }

    // success
    res.json({ success: true, message: "Login successful" });

  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;