// models/JobCard.js
const mongoose = require("mongoose");

const jobCardSchema = mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: Number,
    feedback: String,
    academicPerformance: Number,
    attendance: Number,
    communication: Number,
    teamwork: Number,
    technicalSkills: Number,
    totalProjects: Number,
    progress: Number,
    mentor: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("JobCard", jobCardSchema);
