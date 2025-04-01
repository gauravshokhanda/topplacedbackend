const Interview = require('../models/Interview');
const moment = require("moment");
const sendInterviewEmail = require('../utils/emailService');
// ✅ Create (Schedule Interview)
const scheduleInterview = async (req, res) => {
    try {
        const { selectDate, selectTime, yourField, email, whatsappNumber, name } = req.body;

        if (!selectDate || !selectTime || !yourField || !email || !whatsappNumber || !name) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Validate time format (HH:mm)
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
        .sort({ createdAt: -1 }); // Sort by newest first
  
      res.status(200).json({
        data: interviews,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };

// ✅ Read Single Interview by ID
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

// ✅ Update Interview
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
        }

        interview.selectDate = selectDate || interview.selectDate;
        interview.selectTime = selectTime || interview.selectTime;
        interview.yourField = yourField || interview.yourField;
        interview.name = name || interview.name;
        interview.email = email || interview.email;
        interview.whatsappNumber = whatsappNumber || interview.whatsappNumber;

        await interview.save();
        res.status(200).json({ message: 'Interview updated successfully', interview });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ✅ Delete Interview
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

module.exports = { scheduleInterview, getAllInterviews, getInterviewById, updateInterview, deleteInterview };
