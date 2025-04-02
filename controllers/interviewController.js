const Interview = require('../models/Interview');
const moment = require('moment');
const sendInterviewEmail = require('../utils/emailService');


const ALL_TIME_SLOTS = [
  '11:00', '11:45', '12:30', '15:30'
];


const getStartOfWeek = (date) => {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay()); // Move to Sunday
  return start;
};

// Helper function to generate week dates
const generateWeekDates = (startDate) => {
  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    weekDates.push({
      dateStr: date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }), // e.g., "02 Apr"
      isoDate: date.toISOString().split('T')[0], // e.g., "2025-04-02"
    });
  }
  return weekDates;
};

// ✅ Get Available Slots Per Week
const getAvailableSlotsPerWeek = async (req, res) => {
    try {
      const { weekStart } = req.query; // Optional query param for week start date (e.g., "2025-04-02")
      const referenceDate = weekStart ? new Date(weekStart) : new Date(); // Default to today
      const startOfWeek = getStartOfWeek(referenceDate);
      const weekDates = generateWeekDates(startOfWeek);
  
      // Fetch all interviews
      const interviews = await Interview.find();
  
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
  
      // Calculate available slots for each day of the week
      const availableSlots = weekDates
        .map((day) => {
          const bookedTimes = bookedSlots[day.dateStr] || [];
          const availableTimes = ALL_TIME_SLOTS.filter((time) => !bookedTimes.includes(time));
          return {
            date: day.dateStr, // e.g., "02 Apr"
            isoDate: day.isoDate, // e.g., "2025-04-02"
            availableTimes, // Array of available time slots
            isAvailable: availableTimes.length > 0,
          };
        })
        .filter((slot) => slot.isAvailable); // Filter out dates with no available slots
  
      res.status(200).json({
        weekStart: startOfWeek.toISOString().split('T')[0],
        slots: availableSlots,
      });
    } catch (error) {
      console.error('Error fetching available slots per week:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };

// ✅ Get Available Time Slots for a Specific Date
const getAvailableTimeSlotsForDate = async (req, res) => {
  try {
    const { date } = req.params; // Date in ISO format (e.g., "2025-04-02")
    if (!date || !moment(date, 'YYYY-MM-DD', true).isValid()) {
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD' });
    }

    const targetDate = new Date(date);
    const dateStr = targetDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
    });

    // Fetch all interviews for the specific date
    const interviews = await Interview.find({
      selectDate: {
        $gte: moment(date).startOf('day').toDate(),
        $lte: moment(date).endOf('day').toDate(),
      },
    });

    // Process booked slots for the date
    const bookedTimes = interviews.map((interview) => interview.selectTime);
    const availableTimes = ALL_TIME_SLOTS.filter((time) => !bookedTimes.includes(time));

    res.status(200).json({
      date: dateStr, // e.g., "02 Apr"
      isoDate: date, // e.g., "2025-04-02"
      availableTimes, // Array of available time slots
      isAvailable: availableTimes.length > 0,
    });
  } catch (error) {
    console.error('Error fetching available time slots for date:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Existing functions (unchanged)
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

    const existingInterview = await Interview.findOne({ selectDate, selectTime });
    if (existingInterview) {
      return res.status(400).json({ message: 'Slot already booked, choose a different time' });
    }

    const interview = new Interview({ name, email, whatsappNumber, selectDate, selectTime, yourField });
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

      const dateToCheck = selectDate ? new Date(selectDate) : interview.selectDate;
      const existingInterview = await Interview.findOne({
        selectDate: dateToCheck,
        selectTime: selectTime,
        _id: { $ne: interview._id },
      });

      if (existingInterview) {
        return res.status(400).json({ message: 'Slot already booked, choose a different time' });
      }
    }

    interview.selectDate = selectDate ? new Date(selectDate) : interview.selectDate;
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