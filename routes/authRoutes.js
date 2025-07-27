const express = require("express");
const { authMiddleware } = require("../middlewares/authMiddleware")
const upload = require("../middlewares/upload");
const { signup, verifyOTP, signin, updateProfile, forgotPassword, resetPassword, resendOTP, getProfile } = require("../controllers/authController");

const router = express.Router();

router.post("/signup", signup);
router.post("/verify-otp", verifyOTP);
router.post("/signin", signin);
// router.put("/update-profile", authMiddleware, updateProfile);
router.put("/update-profile", authMiddleware, upload.single("profilePic"), updateProfile);
router.get("/profile", authMiddleware, getProfile);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/resend-otp", resendOTP);



module.exports = router;
