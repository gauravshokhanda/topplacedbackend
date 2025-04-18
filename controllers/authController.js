
// ======================= CONTROLLER - controllers/authController.js =======================
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
    user.profile.studentDetails = {
      ...user.profile.studentDetails,
      ...updates,
      image: req.files?.image ? req.files.image[0].location : user.profile.studentDetails.image,
      resume: req.files?.resume ? req.files.resume[0].location : user.profile.studentDetails.resume,
      technicalSkills: updates.technicalSkills ? JSON.parse(updates.technicalSkills) : user.profile.studentDetails.technicalSkills,
      softSkills: updates.softSkills ? JSON.parse(updates.softSkills) : user.profile.studentDetails.softSkills,
      certifications: updates.certifications ? JSON.parse(updates.certifications) : user.profile.studentDetails.certifications,
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

module.exports = {
  registerUser,
  loginUser,
  getUserById,
  updateStudentProfile,
};
