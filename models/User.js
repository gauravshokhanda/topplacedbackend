// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Student', 'Mentor'], required: true },
  linkedinId: { type: String },
  profile: {
    studentDetails: {
      image: { type: String },              // S3 image URL
      resume: { type: String },             // S3 resume URL (PDF)
      experience: { type: String },
      company: { type: String },
      technicalSkills: [{ type: String }],
      softSkills: [{ type: String }],
      rating: { type: Number },
      feedback: { type: String },
      academicPerformance: { type: String },
      portfolio: { type: String },
      linkedinUrl: { type: String },
      position: { type: String },
      phone: { type: String },
      lookingFor: { type: String },
      totalExperience: { type: String },
      whatsapp: { type: String },
      education: { type: String },
      working: { type: Boolean, default: false },
      certifications: [{ type: String }],
    },
  },
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
});

// Match password during login
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
