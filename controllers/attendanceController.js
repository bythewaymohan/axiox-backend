// const mongoose = require("mongoose");
// const Attendance = require("../models/Attendance");
// const moment = require("moment");

// // Login API - User logs in
// exports.login = async (req, res) => {
//     try {
//         // console.log("Request Body:", req.body);

//         let { userId, date, loginTime } = req.body;

//         if (!mongoose.Types.ObjectId.isValid(userId)) {
//             return res.status(400).json({ message: "Invalid userId format." });
//         }
//         userId = new mongoose.Types.ObjectId(userId);

//         if (!loginTime) {
//             return res.status(400).json({ message: "Login time is required." });
//         }

//         // Convert date format
//         const formattedDate = new Date(date).setHours(0, 0, 0, 0);
//         const existingRecord = await Attendance.findOne({ userId, date: formattedDate });

//         if (existingRecord) {
//             return res.status(400).json({ message: "User has already logged in today." });
//         }

//         // Convert loginTime to IST 12-hour format (AM/PM)
//         const istLoginTime = moment(loginTime, "HH:mm").tz("Asia/Kolkata").format("hh:mm A");

//         // Save attendance record
//         const attendance = new Attendance({
//             userId,
//             date: new Date(date).setHours(0, 0, 0, 0), // Store only date
//             loginTime: istLoginTime,
//             status: "Incomplete"
//         });

//         await attendance.save();
//         res.status(200).json({ message: "Login recorded.", attendance });

//     } catch (error) {
//         console.error("Internal Server Error:", error);
//         res.status(500).json({ message: "Internal Server Error", error });
//     }
// };


// // Logout API - User logs out
// exports.logout = async (req, res) => {
//     try {
//         // console.log("Request Body:", req.body);

//         let { userId, date, logoutTime } = req.body;

//         if (!mongoose.Types.ObjectId.isValid(userId)) {
//             return res.status(400).json({ message: "Invalid userId format." });
//         }
//         userId = new mongoose.Types.ObjectId(userId);

//         if (!logoutTime) {
//             return res.status(400).json({ message: "Logout time is required." });
//         }

//         // Normalize date format
//         const formattedDate = new Date(date).setHours(0, 0, 0, 0);

//         // Find attendance record
//         const attendance = await Attendance.findOne({ userId, date: formattedDate });

//         if (!attendance) {
//             return res.status(404).json({ message: "No login record found for this user on this date." });
//         }

//         if (attendance.logoutTime) {
//             return res.status(400).json({ message: "User has already logged out today." });
//         }

//         // Convert logoutTime to IST 12-hour format (AM/PM)
//         const istLogoutTime = moment(logoutTime, "HH:mm").tz("Asia/Kolkata").format("hh:mm A");

//         // Calculate work duration
//         const loginMoment = moment(attendance.loginTime, "hh:mm A");
//         const logoutMoment = moment(istLogoutTime, "hh:mm A");
//         const workedHours = logoutMoment.diff(loginMoment, "hours", true); // Get hours with decimals

//         // Determine status
//         let status = workedHours >= 9 ? "Complete" : "Incomplete";

//         // Update attendance record
//         attendance.logoutTime = istLogoutTime;
//         attendance.totalHours = parseFloat(workedHours.toFixed(2));
//         attendance.status = status;

//         await attendance.save();
//         res.status(200).json({ message: "Logout recorded.", attendance });

//     } catch (error) {
//         console.error("Internal Server Error:", error);
//         res.status(500).json({ message: "Internal Server Error", error });
//     }
// };


// // Fetch Attendance History
// // exports.getAttendanceHistory = async (req, res) => {
// //     try {
// //         const userId = req.user.userId;

// //         const attendanceHistory = await Attendance.find({ userId })
// //             .sort({ date: -1 })
// //             .select("date loginTime logoutTime totalHours status -_id"); // Include workedHours

// //         res.status(200).json({ message: "Attendance history fetched.", attendanceHistory });
// //     } catch (error) {
// //         res.status(500).json({ message: "Internal Server Error", error });
// //     }
// // };



// exports.getAttendanceHistory = async (req, res) => {
//     try {
//         const userId = req.user.userId; // Ensure this is correctly set in auth middleware

//         if (!userId) {
//             return res.status(400).json({ message: "User ID is required." });
//         }

//         // Fetch attendance history for the user
//         const attendanceHistory = await Attendance.find({ userId })
//             .sort({ date: -1 }) // Sort from latest to oldest
//             .select("date loginTime logoutTime totalHours status -_id"); // Use totalHours instead of workedHours

//         if (attendanceHistory.length === 0) {
//             return res.status(404).json({ message: "No attendance records found." });
//         }

//         res.status(200).json({
//             message: "Attendance history fetched successfully.",
//             attendanceHistory,
//         });
//     } catch (error) {
//         console.error("Error fetching attendance history:", error);
//         res.status(500).json({ message: "Internal Server Error", error });
//     }
// };

const mongoose = require("mongoose");
const Attendance = require("../models/Attendance");
const moment = require("moment-timezone");

// User logs in
exports.login = async (req, res) => {
  try {
    let { userId, date, loginTime } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId format." });
    }

    if (!date || !loginTime) {
      return res.status(400).json({ message: "Date and login time are required." });
    }

    userId = new mongoose.Types.ObjectId(userId);
    const formattedDate = moment(date).startOf("day").toDate();

    const existingRecord = await Attendance.findOne({ userId, date: formattedDate });
    if (existingRecord) {
      return res.status(400).json({ message: "User has already logged in today." });
    }

    const istLoginTime = moment.tz(loginTime, "HH:mm", "Asia/Kolkata").format("hh:mm A");

    const attendance = new Attendance({
      userId,
      date: formattedDate,
      loginTime: istLoginTime,
      status: "Incomplete",
    });

    await attendance.save();
    res.status(200).json({ message: "Login recorded.", attendance });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

// User logs out
exports.logout = async (req, res) => {
  try {
    let { userId, date, logoutTime } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId format." });
    }

    if (!date || !logoutTime) {
      return res.status(400).json({ message: "Date and logout time are required." });
    }

    userId = new mongoose.Types.ObjectId(userId);
    const formattedDate = moment(date).startOf("day").toDate();

    const attendance = await Attendance.findOne({ userId, date: formattedDate });

    if (!attendance) {
      return res.status(404).json({ message: "No login record found for this user on this date." });
    }

    if (attendance.logoutTime) {
      return res.status(400).json({ message: "User has already logged out today." });
    }

    const istLogoutTime = moment.tz(logoutTime, "HH:mm", "Asia/Kolkata").format("hh:mm A");

    // Calculate duration
    const loginMoment = moment(attendance.loginTime, "hh:mm A");
    const logoutMoment = moment(istLogoutTime, "hh:mm A");

    let duration = logoutMoment.diff(loginMoment, "minutes"); // duration in minutes
    const workedHours = parseFloat((duration / 60).toFixed(2));

    attendance.logoutTime = istLogoutTime;
    attendance.totalHours = workedHours;
    attendance.status = workedHours >= 9 ? "Complete" : "Incomplete";

    await attendance.save();
    res.status(200).json({ message: "Logout recorded.", attendance });

  } catch (error) {
    console.error("Logout Error:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

// Attendance History
exports.getAttendanceHistory = async (req, res) => {
  try {
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId." });
    }

    const attendanceHistory = await Attendance.find({ userId })
      .sort({ date: -1 })
      .select("date loginTime logoutTime totalHours status -_id");

    if (!attendanceHistory.length) {
      return res.status(404).json({ message: "No attendance records found." });
    }

    res.status(200).json({
      message: "Attendance history fetched successfully.",
      attendanceHistory,
    });
  } catch (error) {
    console.error("Fetch History Error:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

