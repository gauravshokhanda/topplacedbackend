const express = require('express');
const router = express.Router();
const {
  createJobCard,
  getJobCard,
  getAllJobCards,
  updateJobCard,
  deleteJobCard,
} = require('../controllers/jobCardController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.post('/:studentId',  createJobCard);      // Create job card for a student
router.get('/:studentId',  getJobCard);                 // Get job card by student ID
router.put('/:studentId',  updateJobCard);       // Update job card for a student
router.delete('/:studentId',  deleteJobCard);    // Delete job card for a student
router.get('/',  getAllJobCards);                // List all job cards

module.exports = router;
