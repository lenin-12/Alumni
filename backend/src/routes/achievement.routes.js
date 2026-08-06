const express = require('express');
const router = express.Router();
const {
    getAchievements,
    getAchievementById,
    getAchievementsByAlumni,
    createAchievement,
    updateAchievement,
    deleteAchievement
} = require('../controllers/achievement.controller');
const { protect } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload');

router.get('/all', protect, getAchievements);
router.post('/', protect, upload.single('image'), createAchievement);
router.get('/user/:alumniId', protect, getAchievementsByAlumni);
router.get('/:id', protect, getAchievementById);
router.put('/:id', protect, upload.single('image'), updateAchievement);
router.delete('/:id', protect, deleteAchievement);

module.exports = router;
