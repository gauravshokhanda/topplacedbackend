const Mentor = require('../models/Mentor');

const getMentors = async (req, res) => {
  try {
    const mentors = await Mentor.find();
    res.json(mentors);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const addMentor = async (req, res) => {
  const { name, domain, experience, email } = req.body;
  try {
    const mentor = await Mentor.create({ name, domain, experience, email });
    res.status(201).json(mentor);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getMentors, addMentor };
