
const express = require('express');
const { getMentors, addMentor } = require('../controllers/mentorController');
const { protect, admin } = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/', protect, getMentors);
router.post('/', protect, admin, addMentor);

module.exports = router;
