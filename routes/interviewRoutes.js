const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const { scheduleInterview } = require('../controllers/interviewController.js');

const router = express.Router();

router.post('/schedule', protect, scheduleInterview);

module.exports = router;
