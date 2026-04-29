const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();

/* =======================
   CONFIG
======================= */
const JWT_SECRET = "secret123";

/* =======================
   MIDDLEWARE
======================= */
app.use(express.json());
app.use(cors());

/* =======================
   MongoDB Connection
======================= */
mongoose.connect("mongodb://127.0.0.1:27017/bauetLibraryDB")
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

/* =======================
   USER MODEL
======================= */
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: {
    type: String,
    default: "student"
  }
});

const User = mongoose.model("User", userSchema);

/* =======================
   REGISTER API
======================= */
app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;

  try {
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.json({
        success: false,
        message: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      password: hashedPassword
    });

    await user.save();

    res.json({
      success: true,
      message: "User Registered Successfully"
    });

  } catch (err) {
    res.json({
      success: false,
      message: "Error Registering User"
    });
  }
});

/* =======================
   LOGIN API
======================= */
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.json({
        success: false,
        message: "User not found"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({
        success: false,
        message: "Wrong password"
      });
    }

    // JWT token create
    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      success: true,
      message: "Login Successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      }
    });

  } catch (err) {
    res.json({
      success: false,
      message: "Login Error"
    });
  }
});

/* =======================
   TOKEN VERIFY
======================= */
function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.json({ success: false, message: "No token provided" });
  }

  // Bearer token split
  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.json({ success: false, message: "Invalid token" });
  }
}

/* =======================
   PROTECTED ROUTE
======================= */
app.get("/api/dashboard", verifyToken, (req, res) => {
  res.json({
    success: true,
    message: "Dashboard Accessed",
    user: req.user
  });
});

/* =======================
   SERVER
======================= */
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});