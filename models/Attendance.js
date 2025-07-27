// const mongoose = require("mongoose");
// const moment = require("moment-timezone");

// const attendanceSchema = new mongoose.Schema({
//     userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//     date: { type: Date, required: true }, // Store only the date part
//     loginTime: { type: String, required: true }, // Store time in "hh:mm A"
//     logoutTime: { type: String }, // Nullable, updated when user logs out
//     totalHours: { type: Number, default: 0 }, // Stores total work duration
//     status: { type: String, enum: ["Complete", "Late", "Incomplete"], required: true, default: "Incomplete" }
// });

// // Auto-calculate total hours and update status before saving
// attendanceSchema.pre("save", function (next) {
//     if (this.loginTime && this.logoutTime) {
//         const loginMoment = moment(this.loginTime, "hh:mm A");
//         const logoutMoment = moment(this.logoutTime, "hh:mm A");
//         const duration = logoutMoment.diff(loginMoment, "hours", true); // Get hours with decimals

//         this.totalHours = parseFloat(duration.toFixed(2)); // Round to 2 decimal places
//         this.status = this.totalHours >= 9 ? "Valid" : "Incomplete";
//     }
//     next();
// });

// module.exports = mongoose.model("Attendance", attendanceSchema);


const mongoose = require("mongoose");
const moment = require("moment-timezone");

const attendanceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true },
  loginTime: { type: String, required: true },
  logoutTime: { type: String },
  totalHours: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ["Complete", "Late", "Incomplete"],
    default: "Incomplete",
  },
});

attendanceSchema.pre("save", function (next) {
  if (this.loginTime && this.logoutTime) {
    const loginMoment = moment(this.loginTime, "hh:mm A");
    const logoutMoment = moment(this.logoutTime, "hh:mm A");
    const duration = logoutMoment.diff(loginMoment, "hours", true);

    this.totalHours = parseFloat(duration.toFixed(2));
    this.status = this.totalHours >= 9 ? "Complete" : "Incomplete";
  }
  next();
});

module.exports = mongoose.model("Attendance", attendanceSchema);
