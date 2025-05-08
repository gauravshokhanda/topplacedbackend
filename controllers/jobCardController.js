// controllers/jobCardController.js
const JobCard = require("../models/JobCard");
const User = require("../models/User");

// CREATE
exports.createJobCard = async (req, res) => {
  try {
    const jobCard = await JobCard.create({
      student: req.params.studentId,
      ...req.body,
    });
    res.status(201).json(jobCard);
  } catch (err) {
    res.status(500).json({ message: "Create failed", error: err.message });
  }
};

// READ
exports.getJobCard = async (req, res) => {
  try {
    const studentId = req.params.studentId;

    // Step 1: Find the JobCard
    const jobCard = await JobCard.findOne({ student: studentId });
    if (!jobCard) return res.status(404).json({ message: "Job card not found" });

    // Step 2: Find the User (include image + position)
    const user = await User.findById(studentId).select("name profile");
    if (!user) return res.status(404).json({ message: "User not found" });

    const studentDetails = user.profile?.studentDetails || {};
    const image = studentDetails.image || null;
    const subtitle = studentDetails.position || "Student";

    // Step 3: Return combined response
    res.json({
      ...jobCard.toObject(),
      name: user.name,
      photo: image,
      subtitle: subtitle
    });

  } catch (err) {
    console.error("⚠️ Error in getJobCard:", err.message);
    res.status(500).json({ message: "Fetch failed", error: err.message });
  }
};

// UPDATE
exports.updateJobCard = async (req, res) => {
  try {
    const jobCard = await JobCard.findOneAndUpdate(
      { student: req.params.studentId },
      req.body,
      { new: true }
    );
    if (!jobCard) return res.status(404).json({ message: "Job card not found" });
    res.json(jobCard);
  } catch (err) {
    res.status(500).json({ message: "Update failed", error: err.message });
  }
};
exports.getAllJobCards = async (req, res) => {
  try {
    const jobCards = await JobCard.find().populate("student", "name profile.studentDetails");
    
    const formatted = jobCards.map((card) => {
      const student = card.student;
      const studentDetails = student?.profile?.studentDetails || {};

      return {
        ...card.toObject(),
        name: student?.name,
        photo: studentDetails.image || null,
        subtitle: studentDetails.position || "Student",
      };
    });

    res.status(200).json(formatted);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch job cards", error: err.message });
  }
};

// DELETE
exports.deleteJobCard = async (req, res) => {
  try {
    const jobCard = await JobCard.findOneAndDelete({ student: req.params.studentId });
    if (!jobCard) return res.status(404).json({ message: "Job card not found" });
    res.json({ message: "Job card deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed", error: err.message });
  }
};
