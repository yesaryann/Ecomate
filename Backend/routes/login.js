const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const validateLogin = require("../Middlewares/validateLogin");
const comparePassword = require("../Middlewares/comparePassword");
const User = require("../models/user");
const dotenv = require('dotenv');
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

router.post('/', validateLogin, async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Check if the user's email is verified
    if (!user.isVerified) {
      return res.status(400).json({ message: 'Please verify your email before logging in.' });
    }

    // Validate the password
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect password' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({
      message: 'Login successful',
      token: token,
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
});

module.exports = router;
