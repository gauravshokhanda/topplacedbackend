// models/Mentor.js
const mongoose = require('mongoose');

const mentorSchema = new mongoose.Schema({
  photo: {
    type: String,
    required: [true, 'Mentor photo is required'],
  },
  experience: {
    type: Number,
    required: [true, 'Experience is required'],
    min: [0, 'Experience cannot be negative'],
  },
  field: {
    type: String,
    required: [true, 'Field is required'],
    trim: true,
  },
  course: {
    type: String,
    required: [true, 'Course is required'],
    trim: true,
  },
  company: {
    type: String,
    required: [true, 'Company is required'],
    trim: true,
  },
  linkedIn: {
    type: String,
    required: [true, 'LinkedIn URL is required'],
    trim: true,
    validate: {
      validator: function(v) {
        return /^(https?:\/\/)?([\w]+\.)?linkedin\.com\/.*$/.test(v);
      },
      message: 'Invalid LinkedIn URL',
    },
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    sparse: true,
    validate: {
      validator: function(v) {
        return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Invalid email address',
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

mentorSchema.index({ email: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Mentor', mentorSchema);