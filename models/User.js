const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Student', 'Mentor'], required: true },
  profile: {
    studentDetails: {
      image: { type: String }, // URL or path to the image (e.g., stored in cloud storage like AWS S3)
      phone: { type: String },
      resume: { type: String }, // URL or path to the resume file
      lookingFor: { type: String }, // e.g., "Software Engineer", "Data Scientist"
      linkedinUrl: { type: String },
      totalExperience: { type: String }, // e.g., "2 years"
      whatsapp: { type: String }, // WhatsApp number or link
      education: { type: String }, // e.g., "BS Computer Science"
      working: { type: Boolean, default: false }, // e.g., true if currently working
      certifications: [{ type: String }], // Array of certifications, e.g., ["AWS Certified Developer", "Google Data Analytics"]
    },
  },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);