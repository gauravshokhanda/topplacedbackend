const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const {
    scheduleInterview,
    getAllInterviews,
    getInterviewById,
    updateInterview,
    deleteInterview,
    getAvailableSlotsPerWeek,
    getAvailableTimeSlotsForDate,
    getMyInterviews
} = require('../controllers/interviewController');

const router = express.Router();

router.post('/',protect, scheduleInterview);  // Create
router.get('/my', protect, getMyInterviews);
router.get('/',protect,  getAllInterviews);  // Read All
router.get('/:id',protect,  getInterviewById);  // Read One
router.put('/:id',protect,  updateInterview);  // Update
router.delete('/:id',protect,  deleteInterview);  // Delete
router.get('/available/week', getAvailableSlotsPerWeek); // New: Get available slots for the week
router.get('/available/date/:date', getAvailableTimeSlotsForDate); // New: Get available time slots for a specific date




module.exports = router;
