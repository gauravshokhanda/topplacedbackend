const JobCard = require('../models/JobCard');
const User = require('../models/User');
const JobRole = require('../models/JobRole');

exports.createJobCard = async (req, res) => {
  try {
    const { filledFields, assignedBy } = req.body;
    const studentId = req.params.studentId;

    const student = await User.findById(studentId);
    if (!student || student.role !== 'Student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    const jobRoleId = student.profile?.studentDetails?.jobRoleId;

    if (!jobRoleId) {
      return res.status(400).json({ message: 'Job role not assigned to student' });
    }

    // ✅ Prevent duplicate job card
    const existingCard = await JobCard.findOne({ student: studentId });
    if (existingCard) {
      return res.status(400).json({ message: 'Job card already exists for this student' });
    }

    // ✅ Debug logs
    console.log('📝 Creating JobCard for:', student._id);
    console.log('📄 Filled Fields:', filledFields);

    const jobCard = await JobCard.create({
      student: student._id,
      jobRole: jobRoleId,
      filledFields,
      assignedBy: assignedBy || null,
    });

    res.status(201).json(jobCard);
  } catch (err) {
    console.error('🔥 Error creating JobCard:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getJobCard = async (req, res) => {
  try {
    // console.log('🔍 Fetching JobCard for:', req.params.studentId);

    const jobCard = await JobCard.findOne({ student: req.params.studentId })
      .populate('jobRole', 'name')
      .populate({
        path: 'student',
        select: 'name email profile.studentDetails.image'
      })
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
      .populate({
        path: 'student',
        select: 'name email profile.studentDetails.image'
      })
      .populate('assignedBy', 'name');

    res.status(200).json(jobCards);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateJobCard = async (req, res) => {
  try {
    const jobCard = await JobCard.findByIdAndUpdate(
      req.params.id,
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
