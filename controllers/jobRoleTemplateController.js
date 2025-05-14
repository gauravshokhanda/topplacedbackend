const JobRoleTemplate = require('../models/JobRoleTemplate');

exports.createTemplate = async (req, res) => {
  try {
    const { jobRole, fields } = req.body;

    const existing = await JobRoleTemplate.findOne({ jobRole });
    if (existing) return res.status(400).json({ message: 'Template for this job role already exists' });

    const template = await JobRoleTemplate.create({ jobRole, fields });
    res.status(201).json(template);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getTemplates = async (req, res) => {
  try {
    const templates = await JobRoleTemplate.find().populate('jobRole', 'name');
    res.status(200).json(templates);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getTemplateByRole = async (req, res) => {
  try {
    const template = await JobRoleTemplate.findOne({ jobRole: req.params.roleId }).populate('jobRole', 'name');
    if (!template) return res.status(404).json({ message: 'Template not found for this role' });
    res.status(200).json(template);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateTemplate = async (req, res) => {
  try {
    const template = await JobRoleTemplate.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!template) return res.status(404).json({ message: 'Template not found' });
    res.status(200).json(template);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteTemplate = async (req, res) => {
  try {
    const template = await JobRoleTemplate.findByIdAndDelete(req.params.id);
    if (!template) return res.status(404).json({ message: 'Template not found' });
    res.status(200).json({ message: 'Template deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
