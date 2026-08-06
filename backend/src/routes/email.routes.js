const express = require('express');
const router = express.Router();
const { forgotPassword, resetPassword, sendInvite } = require('../controllers/email.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/invite', protect, sendInvite);

module.exports = router;
