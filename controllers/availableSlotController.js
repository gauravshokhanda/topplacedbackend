// controllers/availableSlotController.js
const AvailableSlot = require('../models/AvailableSlot');
const moment = require('moment');

const addAvailableSlot = async (req, res) => {
  try {
    const { date, timeSlots } = req.body;

    if (!date || !timeSlots || !Array.isArray(timeSlots) || timeSlots.length === 0) {
      return res.status(400).json({ message: 'Date and at least one time slot are required' });
    }

    if (!moment(date, 'YYYY-MM-DD', true).isValid()) {
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD' });
    }

    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeSlots.every((slot) => timeRegex.test(slot))) {
      return res.status(400).json({ message: 'Invalid time format in slots. Use HH:mm' });
    }

    // Check for duplicate time slots in the request
    const uniqueTimeSlots = new Set(timeSlots);
    if (uniqueTimeSlots.size !== timeSlots.length) {
      return res.status(400).json({ message: 'Duplicate time slots are not allowed in the request' });
    }

    const existingSlot = await AvailableSlot.findOne({ date });
    if (existingSlot) {
      // Check if any of the new time slots already exist in the existing slot
      const existingTimes = new Set(existingSlot.timeSlots);
      const hasDuplicates = timeSlots.some(slot => existingTimes.has(slot));
      if (hasDuplicates) {
        return res.status(400).json({ message: 'One or more time slots already exist for this date' });
      }
      // If no duplicates, add new time slots to existing slot
      existingSlot.timeSlots = [...existingTimes, ...timeSlots];
      await existingSlot.save();
      return res.status(200).json({ message: 'Time slots added to existing date', availableSlot: existingSlot });
    }

    const availableSlot = new AvailableSlot({ date, timeSlots });
    await availableSlot.save();

    res.status(201).json({ message: 'Available slot added successfully', availableSlot });
  } catch (error) {
    console.error('Error adding available slot:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateAvailableSlot = async (req, res) => {
  try {
    const { date } = req.params;
    const { timeSlots } = req.body;

    if (!moment(date, 'YYYY-MM-DD', true).isValid()) {
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD' });
    }

    if (!timeSlots || !Array.isArray(timeSlots) || timeSlots.length === 0) {
      return res.status(400).json({ message: 'At least one time slot is required' });
    }

    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeSlots.every((slot) => timeRegex.test(slot))) {
      return res.status(400).json({ message: 'Invalid time format in slots. Use HH:mm' });
    }

    // Check for duplicate time slots in the request
    const uniqueTimeSlots = new Set(timeSlots);
    if (uniqueTimeSlots.size !== timeSlots.length) {
      return res.status(400).json({ message: 'Duplicate time slots are not allowed in the request' });
    }

    const availableSlot = await AvailableSlot.findOneAndUpdate(
      { date },
      { timeSlots: Array.from(uniqueTimeSlots) }, // Ensure unique slots
      { new: true, runValidators: true }
    );

    if (!availableSlot) {
      return res.status(404).json({ message: 'No available slot found for this date' });
    }

    res.status(200).json({ message: 'Available slot updated successfully', availableSlot });
  } catch (error) {
    console.error('Error updating available slot:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Rest of the code remains unchanged
const getAllAvailableSlots = async (req, res) => {
  try {
    const availableSlots = await AvailableSlot.find().sort({ date: 1 });
    res.status(200).json(availableSlots);
  } catch (error) {
    console.error('Error fetching available slots:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAvailableSlotByDate = async (req, res) => {
  try {
    const { date } = req.params;
    if (!moment(date, 'YYYY-MM-DD', true).isValid()) {
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD' });
    }

    const availableSlot = await AvailableSlot.findOne({ date });
    if (!availableSlot) {
      return res.status(404).json({ message: 'No available slots found for this date' });
    }

    res.status(200).json(availableSlot);
  } catch (error) {
    console.error('Error fetching available slot by date:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteAvailableSlot = async (req, res) => {
  try {
    const { date } = req.params;
    if (!moment(date, 'YYYY-MM-DD', true).isValid()) {
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD' });
    }

    const availableSlot = await AvailableSlot.findOneAndDelete({ date });
    if (!availableSlot) {
      return res.status(404).json({ message: 'No available slot found for this date' });
    }

    res.status(200).json({ message: 'Available slot deleted successfully' });
  } catch (error) {
    console.error('Error deleting available slot:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  addAvailableSlot,
  getAllAvailableSlots,
  getAvailableSlotByDate,
  updateAvailableSlot,
  deleteAvailableSlot,
};