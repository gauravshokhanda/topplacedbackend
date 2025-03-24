const mongoose = require("mongoose");

const ResumeSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rawText: { type: String, required: true }, // Full extracted text
    keywords: { type: [String] }, // Keywords for searching
}, { timestamps: true });

module.exports = mongoose.model("Resume", ResumeSchema);
