const Interview = require('../models/Interview');
const AvailableSlot = require('../models/AvailableSlot');
const moment = require('moment');
const sendInterviewEmail = require('../utils/emailService');

// Helper: Get start of week
const getStartOfWeek = (date) => {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay());
  start.setHours(0, 0, 0, 0);
  return start;
};

const scheduleInterview = async (req, res) => {
  try {
    const { selectDate, selectTime, yourField, email, whatsappNumber, name } = req.body;

    if (!selectDate || !selectTime || !yourField || !email || !whatsappNumber || !name) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    const cleanTime = String(selectTime).trim();
    if (!timeRegex.test(cleanTime)) {
      return res.status(400).json({ message: 'Invalid time format. Use HH:mm (24-hour format)' });
    }

    const normalizedDate = require('moment')(selectDate).startOf('day').toDate();

    const availableSlot = await require('../models/AvailableSlot').findOne({
      date: {
        $gte: normalizedDate,
        $lte: require('moment')(selectDate).endOf('day').toDate()
      }
    });

    if (!availableSlot || !availableSlot.timeSlots.some(slot => slot.trim() === cleanTime)) {
      return res.status(400).json({ message: 'Selected time slot is not available' });
    }

    const existingInterview = await require('../models/Interview').findOne({ selectDate: normalizedDate, selectTime: cleanTime });
    if (existingInterview) {
      return res.status(400).json({ message: 'Slot already booked, choose a different time' });
    }

    // ✅ Here's where you create the interview WITH userId
    const interview = new (require('../models/Interview'))({
      name,
      email,
      whatsappNumber,
      selectDate: normalizedDate,
      selectTime: cleanTime,
      yourField,
      userId: req.user._id  // <-- From protect middleware
    });

    await interview.save();

    res.status(201).json({ message: 'Interview scheduled successfully', interview });
  } catch (error) {
    console.error('Error scheduling interview:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};



// ✅ Update Interview
const updateInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    const { selectDate, selectTime, yourField, name, email, whatsappNumber } = req.body;
    const cleanTime = selectTime ? String(selectTime).trim() : null;

    if (cleanTime) {
      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
      if (!timeRegex.test(cleanTime)) {
        return res.status(400).json({ message: 'Invalid time format. Use HH:mm (24-hour format)' });
      }

      const dateToCheck = selectDate
        ? moment(selectDate).startOf('day').toDate()
        : interview.selectDate;

      const availableSlot = await AvailableSlot.findOne({ date: dateToCheck });

      if (!availableSlot || !availableSlot.timeSlots.map(t => t.trim()).includes(cleanTime)) {
        return res.status(400).json({ message: 'Selected time slot is not available' });
      }

      const existingInterview = await Interview.findOne({
        selectDate: dateToCheck,
        selectTime: cleanTime,
        _id: { $ne: interview._id },
      });

      if (existingInterview) {
        return res.status(400).json({ message: 'Slot already booked, choose a different time' });
      }

      interview.selectTime = cleanTime;
      interview.selectDate = dateToCheck;
    }

    interview.yourField = yourField || interview.yourField;
    interview.name = name || interview.name;
    interview.email = email || interview.email;
    interview.whatsappNumber = whatsappNumber || interview.whatsappNumber;

    await interview.save();

    res.status(200).json({ message: 'Interview updated successfully', interview });
  } catch (error) {
    console.error('Error updating interview:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ✅ Get All Interviews
const getAllInterviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Interview.countDocuments();
    const interviews = await Interview.find().skip(skip).limit(limit).sort({ createdAt: -1 });

    res.status(200).json({
      data: interviews,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ✅ Get Interview By ID
const getInterviewById = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) return res.status(404).json({ message: 'Interview not found' });
    res.status(200).json(interview);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ✅ Delete Interview
const deleteInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) return res.status(404).json({ message: 'Interview not found' });

    await interview.deleteOne();
    res.status(200).json({ message: 'Interview deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


const getMyInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({ userId: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      total: interviews.length,
      data: interviews,
    });
  } catch (error) {
    console.error('Error fetching user interviews:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ✅ Get Weekly Slots
const getAvailableSlotsPerWeek = async (req, res) => {
  try {
    const { weekStart } = req.query;
    const referenceDate = weekStart ? new Date(weekStart) : new Date();
    const startOfWeek = getStartOfWeek(referenceDate);
    const endOfWeek = new Date(startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000);
    endOfWeek.setHours(23, 59, 59, 999);

    const availableSlots = await AvailableSlot.find({ date: { $gte: startOfWeek, $lte: endOfWeek } });
    if (!availableSlots.length) {
      return res.status(200).json({ weekStart: startOfWeek.toISOString().split('T')[0], slots: [] });
    }

    const interviews = await Interview.find({ selectDate: { $gte: startOfWeek, $lte: endOfWeek } });

    const bookedSlots = interviews.reduce((acc, interview) => {
      const dateStr = new Date(interview.selectDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
      acc[dateStr] = acc[dateStr] || [];
      acc[dateStr].push(interview.selectTime);
      return acc;
    }, {});

    const result = availableSlots.map(slot => {
      const dateStr = slot.date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
      const isoDate = slot.date.toISOString().split('T')[0];
      const availableTimes = slot.timeSlots || [];
      const bookedTimes = bookedSlots[dateStr] || [];
      const remainingTimes = availableTimes.filter(t => !bookedTimes.includes(t));
      return {
        date: dateStr,
        isoDate,
        availableTimes: remainingTimes,
        isAvailable: remainingTimes.length > 0,
      };
    }).filter(slot => slot.isAvailable);

    res.status(200).json({ weekStart: startOfWeek.toISOString().split('T')[0], slots: result });
  } catch (error) {
    console.error('Error fetching available slots:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ✅ Get Slots for Specific Date
const getAvailableTimeSlotsForDate = async (req, res) => {
  try {
    const { date } = req.params;
    if (!date || !moment(date, 'YYYY-MM-DD', true).isValid()) {
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD' });
    }

    const targetDate = moment(date).startOf('day').toDate();
    const availableSlot = await AvailableSlot.findOne({ date: targetDate });
    const availableTimes = availableSlot ? availableSlot.timeSlots || [] : [];

    const interviews = await Interview.find({
      selectDate: {
        $gte: moment(date).startOf('day').toDate(),
        $lte: moment(date).endOf('day').toDate(),
      },
    });

    const bookedTimes = interviews.map((i) => i.selectTime);
    const remainingTimes = availableTimes.filter((t) => !bookedTimes.includes(t));

    res.status(200).json({
      date: targetDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
      isoDate: date,
      availableTimes: remainingTimes,
      isAvailable: remainingTimes.length > 0,
    });
  } catch (error) {
    console.error('Error fetching available time slots:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  scheduleInterview,
  getAllInterviews,
  getInterviewById,
  updateInterview,
  deleteInterview,
  getAvailableSlotsPerWeek,
  getAvailableTimeSlotsForDate,
  getMyInterviews 
};
