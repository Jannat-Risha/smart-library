const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();

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
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  try {
    // check existing user
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.json({
        success: false,
        message: "User already exists"
      });
    }

    // hash password
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
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Wrong password"
      });
    }

    // create token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      "secret123",
      { expiresIn: "1d" }
    );

    res.status(200).json({
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
    res.status(500).json({
      success: false,
      message: "Login Error"
    });
  }
});

/* =======================
   TOKEN VERIFY MIDDLEWARE
======================= */
function verifyToken(req, res, next) {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(403).json({
      message: "No token provided"
    });
  }

  try {
    const decoded = jwt.verify(token, "secret123");
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      message: "Invalid token"
    });
  }
}

/* =======================
   PROTECTED ROUTE
======================= */
app.get("/dashboard", verifyToken, (req, res) => {
  res.json({
    message: "Dashboard Accessed",
    user: req.user
  });
});

/* =======================
   SERVER
======================= */
app.listen(5000, () => {
  console.log("Server running on port 5000");
});