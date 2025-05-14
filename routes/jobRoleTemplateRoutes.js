const express = require('express');
const router = express.Router();
const {
  createTemplate,
  getTemplates,
  getTemplateByRole,
  updateTemplate,
  deleteTemplate,
} = require('../controllers/jobRoleTemplateController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.post('/',  createTemplate);
router.get('/', getTemplates);
router.get('/:roleId', getTemplateByRole);
router.put('/:id',  updateTemplate);
router.delete('/:id',  deleteTemplate);

module.exports = router;
