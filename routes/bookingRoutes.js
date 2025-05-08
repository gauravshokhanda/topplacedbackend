const express = require('express');
const { createBooking, getBookings } = require('../controllers/bookingController');
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/', protect, createBooking);
router.get('/', protect, getBookings);
router.get('/my-bookings', protect);


module.exports = router;
