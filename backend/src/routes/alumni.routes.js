const express = require('express');
const router = express.Router();
const { getWorkExperiencesByAlumni } = require('../controllers/workexperience.controller');
const { getAchievementsByAlumni } = require('../controllers/achievement.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/:alumniId/workexperience', protect, getWorkExperiencesByAlumni);
router.get('/:alumniId/achievements', protect, getAchievementsByAlumni);

module.exports = router;
