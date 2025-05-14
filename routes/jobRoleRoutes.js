const express = require('express');
const router = express.Router();
const {
  createJobRole,
  getAllJobRoles,
  updateJobRole,
  deleteJobRole,
} = require('../controllers/jobRoleController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.post('/',  createJobRole);
router.get('/', getAllJobRoles);
router.put('/:id',  updateJobRole);
router.delete('/:id',  deleteJobRole);

module.exports = router;
