const express = require('express');
const router = express.Router();
const {
    getRecentContacts,
    getChatHistory,
    editChatMessage,
    deleteChatMessage,
    getGroups,
    createGroup,
    joinGroup,
    exitGroup,
    getGroupMessages,
    editGroupMessage,
    deleteGroupMessage
} = require('../controllers/chat.controller');
const { protect } = require('../middleware/auth.middleware');

// Direct messaging routes
router.get('/recent/:userId', protect, getRecentContacts);
router.get('/history/:userId/:receiverId', protect, getChatHistory);
router.put('/edit/:id', protect, editChatMessage);
router.delete('/delete/:id', protect, deleteChatMessage);

// Group messaging routes
router.get('/groups', protect, getGroups);
router.post('/groups', protect, createGroup);
router.post('/groups/:groupId/join', protect, joinGroup);
router.post('/groups/exit', protect, exitGroup);
router.get('/groups/:groupId/messages', protect, getGroupMessages);
router.put('/group/edit/:id', protect, editGroupMessage);
router.delete('/group/delete/:id', protect, deleteGroupMessage);

module.exports = router;
