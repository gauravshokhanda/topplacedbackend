const express = require('express');
const router = express.Router();
const { assignJobRoleToStudent } = require('../controllers/studentController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.put('/assign-role/:studentId', protect, assignJobRoleToStudent);

module.exports = router;
