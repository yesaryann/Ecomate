const express = require("express");
const router = express.Router();
const validateSignup = require("../Middlewares/validateSignup");
const hashPassword = require("../Middlewares/hashPassword");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL, // Your email
    pass: process.env.EMAIL_PASSWORD, // Your email password or app password
  },
});

router.post("/", validateSignup, hashPassword, async (req, res) => {
  const { username, fullname, email, password, address, phoneNumber } =
    req.body;

  try {
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });

    if (existingUser) {
      const message =
        existingUser.username === username
          ? "Username is already taken"
          : "Email is already taken";
      return res.status(400).json({ message });
    }

    // Create the user with isVerified: false
    const user = new User({
      username,
      fullname,
      email,
      password,
      address,
      phoneNumber,
      isVerified: false, // Initially not verified
    });

    await user.save();

    // Generate a JWT token for email verification
    const verificationToken = jwt.sign({ email }, JWT_SECRET, {
      expiresIn: "1d",
    });

    // Use environment variable or hardcoded URL for production
    const verificationUrl = `https://eco-conscious-z418.onrender.com/verify?token=${verificationToken}`; // Use production URL here
    await transporter.sendMail({
      from: `"EcoConscious" <${process.env.EMAIL}>`,
      to: email,
      subject: "Verify your email",
      html: `<p>Hi ${fullname},</p>
             <p>Welcome to our platform! 🎉</p>
             <p>We're excited to have you on board. To get started, please confirm your email address by clicking on the link below:</p>
             <a href="${verificationUrl}">Verify Email</a>,
             <p>If you didn't sign up, please ignore this email.</p>
             <p>Thanks,</p>
             <p>The EcoConsious Team</p>
           `,
    });

    res
      .status(200)
      .json({ message: "Signup successful. Please verify your email." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
