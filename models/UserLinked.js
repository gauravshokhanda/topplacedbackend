const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    linkedinId: { type: String, unique: true, sparse: true }, // Unique LinkedIn ID (optional)
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String }, // Only for normal email/password login
    profilePicture: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserLinked", userSchema);
