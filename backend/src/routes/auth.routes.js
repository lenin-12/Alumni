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
const { slidingWindowRateLimiter } = require('../middleware/rateLimiter.middleware');

const strictLimiter = slidingWindowRateLimiter({
    windowMs: 15 * 60 * 1000,
    limit: 5,
});

const looseLimiter = slidingWindowRateLimiter({
    windowMs: 15 * 60 * 1000,
    limit: 10,
});

router.post('/register', strictLimiter, upload.single('image'), registerUser);
router.post('/login', strictLimiter, loginUser);
router.post('/google', googleLogin);
router.get('/me', protect, getMe);
router.post('/refresh', looseLimiter, refreshAccessToken);
router.post('/logout', logoutUser);

module.exports = router;