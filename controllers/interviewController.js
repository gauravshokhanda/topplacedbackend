const Interview = require('../models/Interview.js');

const scheduleInterview = async (req, res) => {
    try {
      const { meetingDate, timeOfDay, field, email, whatsapp, name } = req.body;
  
      // ✅ Validate required fields
      if (!meetingDate || !timeOfDay || !field || !email || !whatsapp || !name) {
        return res.status(400).json({ message: 'All fields are required' });
      }
  
      // ✅ Check if the slot is already booked
      const existingInterview = await Interview.findOne({ meetingDate, timeOfDay });
      if (existingInterview) {
        return res.status(400).json({ message: 'Slot already booked, choose a different time' });
      }
  
      // ✅ Create new interview
      const interview = new Interview({
        name,
        email,
        whatsapp,
        meetingDate,
        timeOfDay,
        field
      });
  
      await interview.save();
      res.status(201).json({ message: 'Interview scheduled successfully', interview });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
  
  module.exports = { scheduleInterview };
  


