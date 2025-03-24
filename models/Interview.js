const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    match: [/.+@.+\..+/, 'Please enter a valid email']
  },
  whatsapp: {
    type: String,
    required: [true, 'WhatsApp number is required']
  },
  meetingDate: {
    type: Date,
    required: [true, 'Meeting date is required']
  },
  timeOfDay: {
    type: String,
    required: [true, 'Time of day is required'],
    enum: ['Morning', 'Afternoon', 'Evening', 'Night']
  },
  field: {
    type: String,
    required: [true, 'Field is required'],
    enum: ['Data Analyst', 'Software Engineer', 'DevOps', 'Other']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Interview', interviewSchema);
