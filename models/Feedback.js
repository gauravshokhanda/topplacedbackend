const mongoose = require('mongoose');

const feedbackSchema = mongoose.Schema({
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  feedback: { type: String, required: true },
  score: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
