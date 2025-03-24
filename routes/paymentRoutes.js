const express = require('express');
const { createPayment, getPayments } = require('../controllers/paymentController');
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/', protect, createPayment);
router.get('/', protect, getPayments);

module.exports = router;
