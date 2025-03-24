const express = require("express");
const router = express.Router();
const upload = require("../middlewares/resumeUpload"); // Multer for file upload
const { parsePDF, getResume, updateResume } = require("../controllers/resumeController");
const { protect } = require("../middlewares/authMiddleware"); // Secure routes

// ✅ Upload and store resume (token required)
router.post("/upload", protect, upload.single("resume"), parsePDF);

// ✅ View stored resume (token required)
router.get("/", protect, getResume);

// ✅ Update stored resume (token required)
router.put("/", protect, updateResume);

module.exports = router;
