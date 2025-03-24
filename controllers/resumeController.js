const pdfParse = require("pdf-parse");
const Resume = require("../models/Resume");

// 📌 Upload Resume and Extract Data
const parsePDF = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No file uploaded" });

        const userId = req.user._id;
        if (!userId) return res.status(400).json({ error: "User ID is missing from token" });

        // Extract text from PDF
        const pdfData = await pdfParse(req.file.buffer);
        const extractedText = pdfData.text;

        console.log("Extracted Resume Text:", extractedText);

        // Store in Database
        const newResume = await Resume.findOneAndUpdate(
            { userId },
            { userId, rawText: extractedText },
            { upsert: true, new: true }
        );

        return res.status(200).json({ 
            message: "Resume saved successfully!", 
            resumeId: newResume._id,
            rawText: extractedText
        });

    } catch (error) {
        console.error("PDF Parsing Error:", error);
        return res.status(500).json({ error: "Error processing PDF" });
    }
};

// 📌 View Stored Resume
const getResume = async (req, res) => {
    try {
        const resume = await Resume.findOne({ userId: req.user._id });
        if (!resume) return res.status(404).json({ error: "No resume found" });

        res.json(resume);
    } catch (error) {
        console.error("Error fetching resume:", error);
        res.status(500).json({ error: "Error retrieving resume" });
    }
};

// 📌 Edit & Save Resume Data
const updateResume = async (req, res) => {
    try {
        const userId = req.user._id;
        const { rawText } = req.body;

        const resume = await Resume.findOneAndUpdate(
            { userId },
            { rawText },
            { new: true }
        );

        res.json({ message: "Resume updated successfully!", resume });
    } catch (error) {
        console.error("Error updating resume:", error);
        res.status(500).json({ error: "Error updating resume" });
    }
};

module.exports = { parsePDF, getResume, updateResume };