const mongoose = require('mongoose');

const mentorSchema = mongoose.Schema({
  name: { type: String, required: true },
  domain: { type: String, required: true },
  experience: { type: Number, required: true },
  email: { type: String, required: true, unique: true },
}, { timestamps: true });

module.exports = mongoose.model('Mentor', mentorSchema);
