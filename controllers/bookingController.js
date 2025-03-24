const Booking = require('../models/Booking');

const createBooking = async (req, res) => {
  const { mentor, date } = req.body;
  try {
    const booking = await Booking.create({ student: req.user._id, mentor, date });
    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ student: req.user._id }).populate('mentor', 'name domain');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createBooking, getBookings };
