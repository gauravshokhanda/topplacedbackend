const User = require("../models/User");
const { generateToken } = require("../config/jwt");

const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const user = await User.create({ name, email, password, role });
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password'); // omit password
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'Student' }).select('-password');
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


const updateStudentProfile = async (req, res) => {
  const updates = req.body;

  try {
    const userId = req.body._id || req.user._id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (req.user.role !== "Admin" && req.user._id.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    user.profile = user.profile || {};
    const existing = user.profile.studentDetails || {};

    user.profile.studentDetails = {
      ...existing,
      name: updates.name || existing.name,
      email: updates.email || existing.email,
      bio: updates.bio !== undefined ? updates.bio : existing.bio,
      location: updates.location || existing.location,
      education: updates.education || existing.education,
      experience: updates.experience || existing.experience,
      company: updates.company || existing.company,
      position: updates.position || existing.position,
      phone: updates.phone || existing.phone,
      whatsapp: updates.whatsapp || existing.whatsapp,
      linkedinUrl: updates.linkedinUrl || existing.linkedinUrl,
      githubUrl: updates.githubUrl || existing.githubUrl,
      lookingFor: updates.lookingFor || existing.lookingFor,
      totalExperience: updates.totalExperience || existing.totalExperience,
      academicPerformance: updates.academicPerformance || existing.academicPerformance,
      portfolio: updates.portfolio || existing.portfolio,
      working: updates.working !== undefined ? updates.working : existing.working,
      feedback: updates.feedback || existing.feedback,
      rating: updates.rating || existing.rating,
      image: req.files?.image ? req.files.image[0].location : existing.image,
      resume: req.files?.resume ? req.files.resume[0].location : existing.resume,
      technicalSkills: updates.technicalSkills ? JSON.parse(updates.technicalSkills) : existing.technicalSkills,
      softSkills: updates.softSkills ? JSON.parse(updates.softSkills) : existing.softSkills,
      certifications: updates.certifications ? JSON.parse(updates.certifications) : existing.certifications,
    };

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

const updateStudentById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'Student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Allow only basic fields to update here
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    // Update password if provided
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await user.remove();

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};




module.exports = {
  registerUser,
  loginUser,
  getUserById,
  updateStudentProfile,
  getCurrentUser,
  getAllStudents,
  updateStudentById,
  deleteUserById
};
