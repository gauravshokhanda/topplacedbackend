const express = require('express');
const router = express.Router();
const {
  createJobCard,
  getJobCard,
  getAllJobCards,
  updateJobCard,
  deleteJobCard,
} = require('../controllers/jobCardController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.post('/:studentId',  createJobCard);

router.get('/:studentId',  getJobCard);
router.put('/:id', updateJobCard);      
router.delete('/:studentId',  deleteJobCard);    
router.get('/',  getAllJobCards);                

module.exports = router;
