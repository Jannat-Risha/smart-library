const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  const hashed = await bcrypt.hash(password, 10);

  const user = new User({
    name,
    email,
    password: hashed
  });

  await user.save();
  res.send("User Registered");
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) return res.send("User not found");

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) return res.send("Wrong password");

  const token = jwt.sign({ id: user._id }, "secret123");

  res.json({ token });
});

module.exports = router;