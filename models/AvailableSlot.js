// models/AvailableSlot.js
const mongoose = require('mongoose');

const availableSlotSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: [true, 'Date is required'],
    unique: true, 
  },
  timeSlots: [{
    type: String,
    required: [true, 'Time slot is required'],
    match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:mm)'],
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('AvailableSlot', availableSlotSchema);