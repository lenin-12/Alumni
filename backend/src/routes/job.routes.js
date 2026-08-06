const express = require('express');
const router = express.Router();
const { getJobs, createJob, deleteJob } = require('../controllers/job.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/', protect, getJobs);
router.post('/', protect, createJob);
router.delete('/:id', protect, deleteJob);

module.exports = router;
