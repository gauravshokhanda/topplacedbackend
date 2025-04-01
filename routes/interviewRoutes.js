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

router.post('/', scheduleInterview);  // Create
router.get('/',  getAllInterviews);  // Read All
router.get('/:id',  getInterviewById);  // Read One
router.put('/:id',  updateInterview);  // Update
router.delete('/:id',  deleteInterview);  // Delete

module.exports = router;
