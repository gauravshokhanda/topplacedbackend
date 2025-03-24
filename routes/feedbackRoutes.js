const express = require('express');
const { submitFeedback, getFeedbacks } = require('../controllers/feedbackController');
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/', protect, submitFeedback);
router.get('/', protect, getFeedbacks);

module.exports = router;
