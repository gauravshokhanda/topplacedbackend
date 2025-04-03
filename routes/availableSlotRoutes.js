// routes/availableSlotRoutes.js
const express = require('express');
// const { protect } = require('../middlewares/authMiddleware');
const {
  addAvailableSlot,
  getAllAvailableSlots,
  getAvailableSlotByDate,
  updateAvailableSlot,
  deleteAvailableSlot,
} = require('../controllers/availableSlotController');

const router = express.Router();

// Protect all routes (assuming only authenticated users/admins can manage slots)
// router.use(protect);

router.post('/', addAvailableSlot); // Create a new available slot
router.get('/', getAllAvailableSlots); // Get all available slots
router.get('/:date', getAvailableSlotByDate); // Get available slot by date
router.put('/:date', updateAvailableSlot); // Update available slot by date
router.delete('/:date', deleteAvailableSlot); // Delete available slot by date

module.exports = router;