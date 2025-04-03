const Interview = require('../models/Interview');
const AvailableSlot = require('../models/AvailableSlot');
const moment = require('moment');
const sendInterviewEmail = require('../utils/emailService');

const getStartOfWeek = (date) => {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay()); // Move to Sunday
  start.setHours(0, 0, 0, 0); // Normalize to midnight
  return start;
};

// ✅ Get Available Slots Per Week
const getAvailableSlotsPerWeek = async (req, res) => {
  try {
    const { weekStart } = req.query;
    const referenceDate = weekStart ? new Date(weekStart) : new Date();
    const startOfWeek = getStartOfWeek(referenceDate);
    const endOfWeek = new Date(startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000);
    endOfWeek.setHours(23, 59, 59, 999); // End of day for the last day

    // console.log('Week Start:', startOfWeek.toISOString());
    // console.log('Week End:', endOfWeek.toISOString());

    // Fetch all available slots for the week
    const availableSlots = await AvailableSlot.find({
      date: {
        $gte: startOfWeek,
        $lte: endOfWeek,
      },
    });
    // console.log('Available Slots from DB:', JSON.stringify(availableSlots, null, 2));

    // If no slots are defined for the week, return an empty result
    if (!availableSlots.length) {
      return res.status(200).json({
        weekStart: startOfWeek.toISOString().split('T')[0],
        slots: [],
      });
    }

    // Fetch all interviews for the week
    const interviews = await Interview.find({
      selectDate: {
        $gte: startOfWeek,
        $lte: endOfWeek,
      },
    });
    // console.log('Interviews:', JSON.stringify(interviews, null, 2));

    // Process booked slots
    const bookedSlots = interviews.reduce((acc, interview) => {
      const interviewDate = new Date(interview.selectDate);
      const dateStr = interviewDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
      });
      if (!acc[dateStr]) acc[dateStr] = [];
      acc[dateStr].push(interview.selectTime);
      return acc;
    }, {});
    // console.log('Booked Slots:', bookedSlots);

    // Calculate available slots only for dates that exist in AvailableSlot
    const result = availableSlots.map((slot) => {
      const dateStr = slot.date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
      });
      const isoDate = slot.date.toISOString().split('T')[0];
      const availableTimes = slot.timeSlots || [];
      const bookedTimes = bookedSlots[dateStr] || [];
      const remainingTimes = availableTimes.filter((time) => !bookedTimes.includes(time));
      // console.log(`Date: ${dateStr}, Available Times: ${availableTimes}, Booked Times: ${bookedTimes}, Remaining Times: ${remainingTimes}`);

      return {
        date: dateStr,
        isoDate: isoDate,
        availableTimes: remainingTimes,
        isAvailable: remainingTimes.length > 0,
      };
    }).filter((slot) => slot.isAvailable);

    res.status(200).json({
      weekStart: startOfWeek.toISOString().split('T')[0],
      slots: result,
    });
  } catch (error) {
    console.error('Error fetching available slots per week:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ✅ Get Available Time Slots for a Specific Date
const getAvailableTimeSlotsForDate = async (req, res) => {
  try {
    const { date } = req.params; // Date in ISO format (e.g., "2025-04-03")
    if (!date || !moment(date, 'YYYY-MM-DD', true).isValid()) {
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD' });
    }

    const targetDate = moment(date).startOf('day').toDate(); // Normalize to midnight
    console.log('Target Date:', targetDate.toISOString());

    const dateStr = targetDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
    });

    // Fetch available slots for the specific date
    const availableSlot = await AvailableSlot.findOne({ date: targetDate });
    console.log('Available Slot for Date:', JSON.stringify(availableSlot, null, 2));
    const availableTimes = availableSlot ? availableSlot.timeSlots || [] : [];

    // Fetch all interviews for the specific date
    const interviews = await Interview.find({
      selectDate: {
        $gte: moment(date).startOf('day').toDate(),
        $lte: moment(date).endOf('day').toDate(),
      },
    });
    console.log('Interviews for Date:', JSON.stringify(interviews, null, 2));

    // Process booked slots for the date
    const bookedTimes = interviews.map((interview) => interview.selectTime);
    const remainingTimes = availableTimes.filter((time) => !bookedTimes.includes(time));
    console.log('Available Times:', availableTimes, 'Booked Times:', bookedTimes, 'Remaining Times:', remainingTimes);

    res.status(200).json({
      date: dateStr,
      isoDate: date,
      availableTimes: remainingTimes,
      isAvailable: remainingTimes.length > 0,
    });
  } catch (error) {
    console.error('Error fetching available time slots for date:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add validation in scheduleInterview to check against AvailableSlot
const scheduleInterview = async (req, res) => {
  try {
    const { selectDate, selectTime, yourField, email, whatsappNumber, name } = req.body;

    if (!selectDate || !selectTime || !yourField || !email || !whatsappNumber || !name) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(selectTime)) {
      return res.status(400).json({ message: 'Invalid time format. Use HH:mm (24-hour format)' });
    }

    // Check if the selected date and time are available
    const normalizedDate = moment(selectDate).startOf('day').toDate();
    const availableSlot = await AvailableSlot.findOne({ date: normalizedDate });
    if (!availableSlot || !availableSlot.timeSlots.includes(selectTime)) {
      return res.status(400).json({ message: 'Selected time slot is not available' });
    }

    const existingInterview = await Interview.findOne({ selectDate: normalizedDate, selectTime });
    if (existingInterview) {
      return res.status(400).json({ message: 'Slot already booked, choose a different time' });
    }

    const interview = new Interview({ name, email, whatsappNumber, selectDate: normalizedDate, selectTime, yourField });
    await interview.save();

    await sendInterviewEmail(email, name, selectDate, selectTime);

    res.status(201).json({ message: 'Interview scheduled successfully', interview });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAllInterviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Interview.countDocuments();
    const interviews = await Interview.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

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

const getInterviewById = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }
    res.status(200).json(interview);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    const { selectDate, selectTime, yourField, name, email, whatsappNumber } = req.body;

    if (selectTime) {
      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
      if (!timeRegex.test(selectTime)) {
        return res.status(400).json({ message: 'Invalid time format. Use HH:mm (24-hour format)' });
      }

      const dateToCheck = selectDate ? moment(selectDate).startOf('day').toDate() : interview.selectDate;
      const availableSlot = await AvailableSlot.findOne({ date: dateToCheck });
      if (!availableSlot || !availableSlot.timeSlots.includes(selectTime)) {
        return res.status(400).json({ message: 'Selected time slot is not available' });
      }

      const existingInterview = await Interview.findOne({
        selectDate: dateToCheck,
        selectTime: selectTime,
        _id: { $ne: interview._id },
      });

      if (existingInterview) {
        return res.status(400).json({ message: 'Slot already booked, choose a different time' });
      }
    }

    interview.selectDate = selectDate ? moment(selectDate).startOf('day').toDate() : interview.selectDate;
    interview.selectTime = selectTime || interview.selectTime;
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

const deleteInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    await interview.deleteOne();
    res.status(200).json({ message: 'Interview deleted successfully' });
  } catch (error) {
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
};