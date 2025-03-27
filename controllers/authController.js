const User = require('../models/User');
const { generateToken } = require('../config/jwt');

// Existing registerUser and loginUser functions (unchanged)
const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ name, email, password, role });
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && await user.matchPassword(password)) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateStudentProfile = async (req, res) => {
  const {
    phone,
    lookingFor,
    linkedinUrl,
    totalExperience,
    whatsapp,
    education,
    working,
    certifications,
  } = req.body;

  try {
    // Assuming req.user is set by a middleware (e.g., protect middleware)
    const user = await User.findById(req.user.id);
    console.log("User ID:", req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role !== "Student") return res.status(403).json({ message: "Only students can update this profile" });

    // Initialize profile.studentDetails if it doesn't exist
    user.profile = user.profile || {};
    user.profile.studentDetails = user.profile.studentDetails || {};

    // Handle file uploads (image and resume) to S3
    if (req.files) {
      // If an image file is uploaded, update the image field with the S3 URL
      if (req.files.image) {
        user.profile.studentDetails.image = req.files.image[0].location; // S3 URL
      }
      // If a resume file is uploaded, update the resume field with the S3 URL
      if (req.files.resume) {
        user.profile.studentDetails.resume = req.files.resume[0].location; // S3 URL
      }
    }

    // Update other fields from req.body (only if they are provided in the request)
    user.profile.studentDetails.phone = phone || user.profile.studentDetails.phone;
    user.profile.studentDetails.lookingFor = lookingFor || user.profile.studentDetails.lookingFor;
    user.profile.studentDetails.linkedinUrl = linkedinUrl || user.profile.studentDetails.linkedinUrl;
    user.profile.studentDetails.totalExperience = totalExperience || user.profile.studentDetails.totalExperience;
    user.profile.studentDetails.whatsapp = whatsapp || user.profile.studentDetails.whatsapp;
    user.profile.studentDetails.education = education || user.profile.studentDetails.education;
    user.profile.studentDetails.working = working !== undefined ? working : user.profile.studentDetails.working;
    user.profile.studentDetails.certifications = certifications || user.profile.studentDetails.certifications;

    const updatedUser = await user.save();

    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      profile: updatedUser.profile,
      token: generateToken(updatedUser._id, updatedUser.role),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
module.exports = { registerUser, loginUser, updateStudentProfile };