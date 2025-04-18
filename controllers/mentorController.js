// controllers/mentorController.js
const Mentor = require('../models/Mentor');
const bcrypt = require('bcryptjs');

// Create a new mentor
exports.createMentor = async (req, res) => {
  try {
    const { photo, experience, field, course, company, linkedIn, password, isActive } = req.body;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const mentor = new Mentor({
      photo,
      experience,
      field,
      course,
      company,
      linkedIn,
      password: hashedPassword,
      isActive: isActive !== undefined ? isActive : true, // Default to true if not provided
    });
    console.log("mentor data", mentor);

    await mentor.save();
    res.status(201).json({ message: 'Mentor created successfully', mentor });
  } catch (error) {
    res.status(400).json({ message: 'Error creating mentor', error: error.message });
  }
};

// Get all active mentors
exports.getAllMentors = async (req, res) => {
  try {
    const mentors = await Mentor.find({ isActive: true });
    res.status(200).json(mentors);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching mentors', error: error.message });
  }
};

// Get a single mentor by ID
exports.getMentorById = async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.id);
    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found' });
    }
    res.status(200).json(mentor);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching mentor', error: error.message });
  }
};

// Update a mentor
exports.updateMentor = async (req, res) => {
  try {
    const { password, isActive, ...updateData } = req.body;

    // If password is provided, hash it
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Include isActive if provided
    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    const mentor = await Mentor.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found' });
    }

    res.status(200).json({ message: 'Mentor updated successfully', mentor });
  } catch (error) {
    res.status(400).json({ message: 'Error updating mentor', error: error.message });
  }
};

// Set mentor active/inactive
exports.setMentorStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    const mentor = await Mentor.findByIdAndUpdate(
      req.params.id,
      { $set: { isActive } },
      { new: true }
    );

    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found' });
    }

    res.status(200).json({
      message: `Mentor set to ${isActive ? 'active' : 'inactive'} successfully`,
      mentor,
    });
  } catch (error) {
    res.status(400).json({ message: 'Error updating mentor status', error: error.message });
  }
};