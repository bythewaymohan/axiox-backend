// routes/certificateRoutes.js
const express = require('express');
const router = express.Router();
const Certificate = require('../models/Certificate');

// @desc Get all certificates by user ID
// @route GET /api/certificates/user/:userId
// @access Public or Protected (depends on your setup)
router.get('/user/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;

        const certificates = await Certificate.find({ user: userId }).populate('user', 'name email');

        res.status(200).json(certificates);
    } catch (error) {
        console.error('Error fetching certificates by user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
