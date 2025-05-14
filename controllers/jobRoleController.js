const JobRole = require('../models/JobRole');

exports.createJobRole = async (req, res) => {
  try {
    const { name } = req.body;
    const existing = await JobRole.findOne({ name });
    if (existing) return res.status(400).json({ message: 'Job role already exists' });

    const role = await JobRole.create({ name });
    res.status(201).json(role);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getAllJobRoles = async (req, res) => {
  try {
    const roles = await JobRole.find().sort({ name: 1 });
    res.status(200).json(roles);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateJobRole = async (req, res) => {
  try {
    const role = await JobRole.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!role) return res.status(404).json({ message: 'Job role not found' });
    res.status(200).json(role);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteJobRole = async (req, res) => {
  try {
    const role = await JobRole.findByIdAndDelete(req.params.id);
    if (!role) return res.status(404).json({ message: 'Job role not found' });
    res.status(200).json({ message: 'Job role deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
