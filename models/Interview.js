const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  selectDate: {
    type: Date,
    required: [true, 'Select Date is required']
  },
  selectTime: {
    type: String,
    required: [true, 'Select Time is required'],
    match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:mm)']
  },
  yourField: {
    type: String,
    required: [true, 'Your Field is required'],
    enum: ['Data Analyst', 'Software Engineer', 'DevOps', 'Other']
  },
  name: {
    type: String,
    required: [true, 'Name is required']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    match: [/.+@.+\..+/, 'Please enter a valid email']
  },
  whatsappNumber: {
    type: String,
    required: [true, 'WhatsApp Number is required']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Interview', interviewSchema);
