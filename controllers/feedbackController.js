const Feedback = require('../models/Feedback');

const submitFeedback = async (req, res) => {
  const { mentor, feedback, score } = req.body;
  try {
    const newFeedback = await Feedback.create({ student: req.user._id, mentor, feedback, score });
    res.status(201).json(newFeedback);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ mentor: req.query.mentorId }).populate('student', 'name');
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { submitFeedback, getFeedbacks };
