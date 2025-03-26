const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const {
    scheduleInterview,
    getAllInterviews,
    getInterviewById,
    updateInterview,
    deleteInterview
} = require('../controllers/interviewController');

const router = express.Router();

router.post('/schedule', protect, scheduleInterview);  // Create
router.get('/', protect, getAllInterviews);  // Read All
router.get('/:id', protect, getInterviewById);  // Read One
router.put('/:id', protect, updateInterview);  // Update
router.delete('/:id', protect, deleteInterview);  // Delete

module.exports = router;
