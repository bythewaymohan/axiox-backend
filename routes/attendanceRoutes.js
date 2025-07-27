const express = require("express");
const { login, logout, getAttendanceHistory } = require("../controllers/attendanceController");
const { authMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/login", authMiddleware, login);
router.post("/logout", authMiddleware, logout);
router.get("/history", authMiddleware, getAttendanceHistory);

module.exports = router;
