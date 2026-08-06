const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    googleLogin,
    getMe,
    refreshAccessToken,
    logoutUser,
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload');

router.post('/register', upload.single('image'), registerUser);
router.post('/login', loginUser);
router.post('/google', googleLogin);
router.get('/me', protect, getMe);
router.post('/refresh', refreshAccessToken);
router.post('/logout', logoutUser);

module.exports = router;