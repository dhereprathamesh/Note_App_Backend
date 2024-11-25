const User = require("../models/User");
const OTP = require("../models/OTP");
const generateOTP = require("../utils/generateOTP");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

const sendOTP = async (req, res) => {
  const { email } = req.body;

  // Check if email is provided
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  // Generate OTP and set expiration time (valid for 10 minutes)
  const otp = generateOTP();
  const otpExpires = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes

  try {
    // Check if OTP exists for the given email
    let otpRecord = await OTP.findOne({ email });

    if (!otpRecord) {
      // If OTP record doesn't exist, create a new OTP record
      otpRecord = new OTP({ email, otp, otpExpires });
    } else {
      // If OTP record exists, update OTP and expiration time
      otpRecord.otp = otp;
      otpRecord.otpExpires = otpExpires;
    }

    // Save OTP record
    await otpRecord.save();

    // Set up the email transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false, // Ignore certificate errors
      },
    });

    // Send the OTP email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
    });

    // Respond with success
    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    // Catch and handle any errors
    res.status(500).json({ error: error.message });
  }
};

const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const otpRecord = await OTP.findOne({ email });

    if (!otpRecord) {
      return res.status(400).json({ error: "OTP not found for this email" });
    }

    if (otpRecord.otp !== otp || otpRecord.otpExpires < Date.now()) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    // OTP is valid, proceed to register the user
    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const register = async (req, res) => {
  const { name, email, dob, otp } = req.body;

  try {
    // Check if OTP is valid first
    const otpRecord = await OTP.findOne({ email });

    if (!otpRecord) {
      return res
        .status(400)
        .json({ error: "Invalid email address or OTP not sent" });
    }

    if (otpRecord.otp !== otp || otpRecord.otpExpires < Date.now()) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    // Create the user only if OTP is valid
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ error: "User already exists" });
    }

    user = new User({
      name,
      email,
      dob,
    });

    await user.save();

    // After registration, remove the OTP record
    await OTP.deleteOne({ email });

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h", // Token expires in 1 hour
      }
    );

    res.status(201).json({ message: "User registered successfully", token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
  const { email, otp } = req.body;

  // Check if email and OTP are provided
  if (!email || !otp) {
    return res.status(400).json({ error: "Email and OTP are required" });
  }

  try {
    // Check if the user exists
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    // Check if the OTP is valid and not expired
    const otpRecord = await OTP.findOne({ email });

    if (!otpRecord) {
      return res.status(400).json({ error: "OTP not found for this email" });
    }

    // Verify OTP
    if (otpRecord.otp !== otp || otpRecord.otpExpires < Date.now()) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    // OTP is valid, generate a JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "1h" } // Token expires in 1 hour
    );

    // Respond with the token
    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { sendOTP, verifyOTP, register, login };
