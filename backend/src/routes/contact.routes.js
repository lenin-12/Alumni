const express = require('express');
const router = express.Router();
const { submitMessage, getMessages, resolveMessage, deleteMessage } = require('../controllers/contact.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Public route to submit a contact message
router.post('/submit', submitMessage);

// Admin-only routes to manage submissions
// We accept both 'admin' and 'ADMIN' due to frontend role checks case-insensitivity
router.get('/all', protect, authorize('ADMIN', 'admin'), getMessages);
router.put('/:id/resolve', protect, authorize('ADMIN', 'admin'), resolveMessage);
router.delete('/:id', protect, authorize('ADMIN', 'admin'), deleteMessage);

module.exports = router;
