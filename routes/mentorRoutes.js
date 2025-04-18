// routes/mentorRoutes.js
const express = require('express');
const router = express.Router();
const mentorController = require('../controllers/mentorController');
const { uploadSingle, getS3Url } = require('../utils/s3Upload');
require('dotenv').config();

// Middleware for uploading 'photo' field
const uploadPhoto = uploadSingle('photo');

// CRUD Routes
router.post('/', uploadPhoto, async (req, res, next) => {
  try {
    // Extract text fields from req.body
    const { experience, field, course, company, linkedIn, password, isActive } = req.body;

    // Handle photo file upload to S3
    let photo = '';
    if (req.file) {
      photo = getS3Url(process.env.AWS_S3_BUCKET, process.env.AWS_REGION, req.file.key);
    } else {
      return res.status(400).json({ message: 'Photo is required' });
    }

    // Prepare mentor data
    const mentorData = {
      photo,
      experience: Number(experience),
      field,
      course,
      company,
      linkedIn,
      password,
      isActive: isActive !== undefined ? isActive === 'true' || isActive === true : true,
    };

    // Call controller with custom data
    req.body = mentorData;
    await mentorController.createMentor(req, res);
  } catch (error) {
    next(error);
  }
});

router.get('/', mentorController.getAllMentors);
router.get('/:id', mentorController.getMentorById);
router.put('/:id', mentorController.updateMentor);
router.patch('/:id/status', mentorController.setMentorStatus);

module.exports = router;