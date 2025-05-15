const User = require('../models/User');
const JobRole = require('../models/JobRole');

exports.assignJobRoleToStudent = async (req, res) => {
  try {
    const { position } = req.body;
    const { studentId } = req.params;

    const student = await User.findById(studentId);
    if (!student || student.role !== 'Student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    const jobRole = await JobRole.findOne({
      name: { $regex: new RegExp(`^${position.trim()}$`, 'i') },
    });

    if (!jobRole) {
      return res.status(404).json({ message: 'Job role not found' });
    }

    student.profile.studentDetails.position = jobRole.name; // optional
    student.profile.studentDetails.jobRoleId = jobRole._id;

    await student.save();

    res.status(200).json({ message: 'Job role assigned successfully', student });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
