const express = require('express');
const router = express.Router();
const { searchChatUsers, getGroupMembers } = require('../controllers/chat.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/', protect, searchChatUsers);
router.get('/groups/:groupId/members', protect, getGroupMembers);

module.exports = router;
