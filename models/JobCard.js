const mongoose = require('mongoose');

const filledFieldSchema = new mongoose.Schema({
  label: { type: String },
  value: { type: mongoose.Schema.Types.Mixed }, // string, number, boolean etc.
}, { _id: false });

const jobCardSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // ✅ Prevents duplicate job cards per student
  },
  jobRole: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobRole',
    required: true,
  },
  filledFields: [filledFieldSchema],
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

module.exports = mongoose.model('JobCard', jobCardSchema);
