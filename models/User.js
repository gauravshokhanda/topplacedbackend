const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Student', 'Teacher', 'Admin'], required: true },
  linkedinId: { type: String },
  profile: {
    studentDetails: {
      image: { type: String },
      resume: { type: String },
      position: { type: String },
      jobRoleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'JobRole',
      },
      experience: { type: String },
      company: { type: String },
      position: { type: String },           // New
      phone: { type: String },
      bio: { type: String },           // New
      whatsapp: { type: String },           // New
      education: { type: String },
      linkedinUrl: { type: String },        // New
      githubUrl: { type: String },          // New
      portfolio: { type: String },
      location: { type: String },           // Moved up for consistency
      lookingFor: { type: String },         // New
      totalExperience: { type: String },    // New
      academicPerformance: { type: String },
      working: { type: Boolean, default: false },
      rating: { type: Number },
      feedback: { type: String },
      technicalSkills: [{ type: String }],
      softSkills: [{ type: String }],
      certifications: [{ type: String }],
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
