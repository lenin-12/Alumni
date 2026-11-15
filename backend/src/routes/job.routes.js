const express = require('express');
const router = express.Router();
const { getJobs, createJob, deleteJob } = require('../controllers/job.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate');
const { jobCreateSchema } = require('../schemas/validation.schemas');

router.get('/', protect, getJobs);
router.post('/', protect, validate(jobCreateSchema), createJob);
router.delete('/:id', protect, deleteJob);

module.exports = router;
