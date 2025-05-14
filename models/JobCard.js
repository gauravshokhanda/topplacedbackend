const mongoose = require('mongoose');

const jobCardSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  jobRole: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobRole',
    required: true,
  },
  filledFields: [
    {
      label: { type: String },
      value: { type: mongoose.Schema.Types.Mixed }, // can be string, number, boolean
    },
  ],
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // the admin who created it
  },
}, { timestamps: true });

module.exports = mongoose.model('JobCard', jobCardSchema);
