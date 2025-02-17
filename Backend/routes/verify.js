const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const dotenv = require("dotenv");
dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

router.get("/", async (req, res) => {
  const { token } = req.query;
  console.log(req.query.token);

  if (!token) {
    return res.status(400).json({ message: "Token is required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.exp < Date.now() / 1000) {
      return res.status(400).json({ message: "Token has expired" });
    }

    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid token or user does not exist" });
    }

    // Check if user is already verified
    if (user.isVerified) {
      return res.status(400).json({ message: "Email is already verified" });
    }

    // Update the user's isVerified field to true
    user.isVerified = true;
    await user.save();

    res
      .status(200)
      .json({ message: "Email verified successfully. You can now log in." });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Invalid or expired token" });
  }
});

module.exports = router;
