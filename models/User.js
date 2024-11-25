const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: false }, // Set name as optional
    email: { type: String, required: true, unique: true },
    dob: { type: Date, required: false }, // Set dob as optional
    otp: { type: String },
    otpExpires: { type: Date },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
