const express = require('express');
const router = express.Router();
const {
    getWorkExperiences,
    getWorkExperienceById,
    getWorkExperiencesByAlumni,
    createWorkExperience,
    updateWorkExperience,
    deleteWorkExperience
} = require('../controllers/workexperience.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate');
const { workExperienceCreateSchema } = require('../schemas/validation.schemas');

router.get('/', protect, getWorkExperiences);
router.post('/', protect, validate(workExperienceCreateSchema), createWorkExperience);
router.get('/user/:alumniId', protect, getWorkExperiencesByAlumni);
router.get('/:id', protect, getWorkExperienceById);
router.put('/:id', protect, updateWorkExperience);
router.delete('/:id', protect, deleteWorkExperience);

module.exports = router;
