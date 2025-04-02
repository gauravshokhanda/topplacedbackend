const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const {
    scheduleInterview,
    getAllInterviews,
    getInterviewById,
    updateInterview,
    deleteInterview,
    getAvailableSlotsPerWeek,
    getAvailableTimeSlotsForDate
} = require('../controllers/interviewController');

const router = express.Router();

router.post('/', scheduleInterview);  // Create
router.get('/',  getAllInterviews);  // Read All
router.get('/:id',  getInterviewById);  // Read One
router.put('/:id',  updateInterview);  // Update
router.delete('/:id',  deleteInterview);  // Delete
router.get('/available/week', getAvailableSlotsPerWeek); // New: Get available slots for the week
router.get('/available/date/:date', getAvailableTimeSlotsForDate); // New: Get available time slots for a specific date

module.exports = router;
