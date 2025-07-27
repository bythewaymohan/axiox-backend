const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  otp: { type: String },
  otpExpires: { type: Date },

  // Profile update fields
  collegeName: { type: String },
  collegeYear: { type: String },
  branch: { type: String },
  course: { type: String },
  profilePic: { type: String },            // ✅ Image URL from Cloudinary
  profilePicPublicId: { type: String },    // ✅ Public ID for deletion
  linkedin: { type: String },
});

module.exports = mongoose.model("User", UserSchema);
