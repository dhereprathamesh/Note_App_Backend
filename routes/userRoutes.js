const express = require("express");
const {
  sendOTP,
  verifyOTP,
  register,
  login,
} = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/register", register);
router.post("/login", login);

router.get("/profile", authMiddleware, (req, res) => {
  res
    .status(200)
    .json({ message: "This is a protected route", user: req.user });
});

module.exports = router;
