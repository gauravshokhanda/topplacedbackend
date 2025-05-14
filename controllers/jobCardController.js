const JobCard = require('../models/JobCard');
const User = require('../models/User');
const JobRole = require('../models/JobRole');

exports.createJobCard = async (req, res) => {
  try {
    const { filledFields } = req.body;
    const studentId = req.params.studentId;

    const student = await User.findById(studentId);
    if (!student || student.role !== 'Student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    const position = student.profile?.studentDetails?.position;
    if (!position) return res.status(400).json({ message: 'Student position not set' });

    const jobRole = await JobRole.findOne({ name: position });
    if (!jobRole) return res.status(404).json({ message: `No job role found for position: ${position}` });

    const jobCard = await JobCard.create({
      student: student._id,
      jobRole: jobRole._id,
      filledFields,
      assignedBy: req.body.assignedBy || null,
    });

    res.status(201).json(jobCard);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


exports.getJobCard = async (req, res) => {
  try {
    const jobCard = await JobCard.findOne({ student: req.params.studentId })
      .populate('jobRole', 'name')
      .populate('student', 'name email')
      .populate('assignedBy', 'name');

    if (!jobCard) return res.status(404).json({ message: 'Job card not found' });

    res.status(200).json(jobCard);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getAllJobCards = async (req, res) => {
  try {
    const jobCards = await JobCard.find()
      .populate('jobRole', 'name')
      .populate('student', 'name email')
      .populate('assignedBy', 'name');

    res.status(200).json(jobCards);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateJobCard = async (req, res) => {
  try {
    const jobCard = await JobCard.findOneAndUpdate(
      { student: req.params.studentId },
      req.body,
      { new: true }
    );
    if (!jobCard) return res.status(404).json({ message: 'Job card not found' });

    res.status(200).json(jobCard);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteJobCard = async (req, res) => {
  try {
    const jobCard = await JobCard.findOneAndDelete({ student: req.params.studentId });
    if (!jobCard) return res.status(404).json({ message: 'Job card not found' });

    res.status(200).json({ message: 'Job card deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
