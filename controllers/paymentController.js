const Payment = require('../models/Payment');

const createPayment = async (req, res) => {
  const { amount } = req.body;
  try {
    const payment = await Payment.create({ user: req.user._id, amount });
    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createPayment, getPayments };
