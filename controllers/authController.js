const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const sendOTPEmail = require("../utils/emailService");
const cloudinary = require("../utils/cloudinary");

// Signup API
exports.signup = async (req, res) => {
    try {
        const { username, fullName, email, phone, password, confirmPassword } = req.body;

        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 min

        const user = new User({ username, fullName, email, phone, password: hashedPassword, otp, otpExpires });
        await user.save();

        //await sendOTPEmail(email, otp);
        await sendOTPEmail(email, otp, "Your OTP for Verification", "Welcome! Please verify your email.");
        res.status(201).json({ message: "User registered. OTP sent to email." });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error });
    }
};

// OTP Verification API
exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });

        if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        user.isVerified = true;
        user.otp = null;
        user.otpExpires = null;
        await user.save();

        res.status(200).json({ message: "Account verified successfully" });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error });
    }
};

// Resend OTP API
exports.resendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: "User is already verified" });
        }

        // Generate a new OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes
        await user.save();

        // Send the new OTP to email
        await sendOTPEmail(email, otp, "Your New OTP for Verification", "Here is your new OTP for email verification.");

        res.status(200).json({ message: "New OTP sent to email" });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error });
    }
};


// Signin API
exports.signin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !user.isVerified) {
            return res.status(400).json({ message: "User not found or not verified" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        // Exclude password and sensitive data from response
        const userData = {
            _id: user._id,
            username: user.username,
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            profilePic: user.profilePic,
            linkedin: user.linkedin,
        };

        res.status(200).json({ message: "Login successful", token, user: userData });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error });
    }
};

//Get profile details
exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.userId; // Extract user ID from token

        const user = await User.findById(userId).select("-password -otp -otpExpires -__v -_id"); // Exclude unwanted fields
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "User profile fetched successfully", user });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error });
    }
};



//Update Profile Data
// exports.updateProfile = async (req, res) => {
//     try {
//         const userId = req.user.userId; // Extract user ID from token
//         const { fullName, collegeName, collegeYear, branch, course, profilePic, linkedin } = req.body;

//         const user = await User.findById(userId);
//         if (!user) {
//             return res.status(404).json({ message: "User not found" });
//         }
//         user.fullName = fullName || user.fullName;
//         user.collegeName = collegeName || user.collegeName;
//         user.collegeYear = collegeYear || user.collegeYear;
//         user.branch = branch || user.branch;
//         user.course = course || user.course;
//         user.profilePic = profilePic || user.profilePic;
//         user.linkedin = linkedin || user.linkedin;

//         await user.save();
//         res.status(200).json({ message: "Profile updated successfully", user });
//     } catch (error) {
//         res.status(500).json({ message: "Internal Server Error", error });
//     }
// };


exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { fullName, collegeName, collegeYear, branch, course, linkedin } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    let profilePicUrl = user.profilePic;
    let profilePicPublicId = user.profilePicPublicId;

    // 🔁 Upload new image and delete old one
    if (req.file) {
      // Delete previous image from Cloudinary
      if (profilePicPublicId) {
        await cloudinary.uploader.destroy(profilePicPublicId);
      }

      // Upload new image
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "user_profiles",
      });

      profilePicUrl = result.secure_url;
      profilePicPublicId = result.public_id;
    }

    // ✅ Update user fields
    user.fullName = fullName || user.fullName;
    user.collegeName = collegeName || user.collegeName;
    user.collegeYear = collegeYear || user.collegeYear;
    user.branch = branch || user.branch;
    user.course = course || user.course;
    user.linkedin = linkedin || user.linkedin;
    user.profilePic = profilePicUrl;
    user.profilePicPublicId = profilePicPublicId;

    await user.save();

    res.status(200).json({ message: "Profile updated successfully", user });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};



// Forget Password - Send OTP to Email
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes
        await user.save();

        // Send OTP to email
        //await sendOTPEmail(email, otp);
        await sendOTPEmail(email, otp, "Your Password Reset OTP", "Reset your password using this OTP.");

        res.status(200).json({ message: "OTP sent to email" });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error });
    }
};

// Reset Password - Verify OTP & Set New Password
exports.resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword, confirmPassword } = req.body;
        const user = await User.findOne({ email });

        if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.otp = null;
        user.otpExpires = null;
        await user.save();

        res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error });
    }
};
