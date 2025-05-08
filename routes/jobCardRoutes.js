// routes/jobCardRoutes.js
const express = require("express");
const router = express.Router();
const {
  createJobCard,
  getJobCard,
  getAllJobCards,
  updateJobCard,
  deleteJobCard,
} = require("../controllers/jobCardController");
const { protect ,admin} = require("../middlewares/authMiddleware");

router.post("/:studentId", protect, createJobCard);
router.get("/:studentId", protect, getJobCard);
router.put("/:studentId", protect, updateJobCard);
router.delete("/:studentId", protect, deleteJobCard);

router.get("/", getAllJobCards);

module.exports = router;
