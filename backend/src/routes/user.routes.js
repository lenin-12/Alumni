const express = require('express');
const router = express.Router();
const { 
  getUsers, 
  getUserById, 
  updateProfile, 
  getLeaderboard, 
  searchUsers,
  getAllUsersForAdmin,
  promoteToAdmin,
  demoteFromAdmin,
  getUserPoints
} = require('../controllers/user.controller');
const { protect, authorize, optionalProtect } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload');

router.get('/', optionalProtect, getUsers);

router.get('/leaderboard', protect, getLeaderboard);
router.get('/search', protect, searchUsers);
router.get('/admin/allUsers', protect, authorize('ADMIN'), getAllUsersForAdmin);
router.patch('/:id/promote', protect, authorize('ADMIN'), promoteToAdmin);
router.patch('/:id/demote', protect, authorize('ADMIN'), demoteFromAdmin);
router.get('/:id/points', protect, getUserPoints);
router.get('/:id', protect, getUserById);
router.put('/:id/updateProfile', protect, upload.single('image'), updateProfile);

module.exports = router;