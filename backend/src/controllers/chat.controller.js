const ChatMessage = require('../models/ChatMessage');
const ChatGroup = require('../models/ChatGroup');
const GroupMessage = require('../models/GroupMessage');
const User = require('../models/User');

// ==========================================
// 1. DIRECT MESSAGE CONTROLLER ACTIONS
// ==========================================

// GET /api/chat/recent/:userId
// Aggregates and returns unique recent users who have chatted with the user
const getRecentContacts = async (req, res) => {
    try {
        const { userId } = req.params;

        // Find all messages involving the user
        const messages = await ChatMessage.find({
            $or: [{ senderId: userId }, { receiverId: userId }]
        }).sort({ createdAt: -1 });

        // Extract unique user IDs of contacts
        const contactIds = new Set();
        messages.forEach(msg => {
            if (msg.senderId.toString() !== userId) {
                contactIds.add(msg.senderId.toString());
            }
            if (msg.receiverId.toString() !== userId) {
                contactIds.add(msg.receiverId.toString());
            }
        });

        // Query details for each contact
        const contacts = await User.find({ _id: { $in: Array.from(contactIds) } })
            .select('name lastName email imageUrl role batch department');

        res.json(contacts);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/chat/history/:userId/:receiverId
// Returns direct chat message history between two users
const getChatHistory = async (req, res) => {
    try {
        const { userId, receiverId } = req.params;

        const messages = await ChatMessage.find({
            $or: [
                { senderId: userId, receiverId: receiverId },
                { senderId: receiverId, receiverId: userId }
            ]
        }).sort({ createdAt: 1 });

        res.json(messages);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// PUT /api/chat/edit/:id
// Edits direct message content
const editChatMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const newContent = typeof req.body === 'string' ? req.body : req.body.content;

        const message = await ChatMessage.findById(id);
        if (!message) {
            return res.status(404).json({ success: false, message: 'Message not found' });
        }

        // Access check
        if (req.user && message.senderId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to edit this message' });
        }

        message.content = newContent;
        await message.save();
        res.json(message);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// DELETE /api/chat/delete/:id
// Deletes a direct message
const deleteChatMessage = async (req, res) => {
    try {
        const { id } = req.params;

        const message = await ChatMessage.findById(id);
        if (!message) {
            return res.status(404).json({ success: false, message: 'Message not found' });
        }

        // Access check
        if (req.user && message.senderId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this message' });
        }

        await ChatMessage.findByIdAndDelete(id);
        res.json({ success: true, message: 'Message deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/searchchat?query=...
// Searches for users to chat with (excluding admins and self)
const searchChatUsers = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.json([]);
        }

        const regex = new RegExp(query, 'i');
        
        let roleCriteria = { role: { $ne: 'ADMIN' } };
        if (req.user && req.user.role === 'ALUMNI') {
            roleCriteria = { role: 'ALUMNI' };
        }

        const users = await User.find({
            $and: [
                roleCriteria,
                { _id: { $ne: req.user.id } },
                { $or: [{ name: regex }, { lastName: regex }, { email: regex }] }
            ]
        }).select('name lastName email imageUrl role batch department');

        res.json(users);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// 2. GROUP CHAT CONTROLLER ACTIONS
// ==========================================

// GET /api/chat/groups
// Returns all group chats
const getGroups = async (req, res) => {
    try {
        const groups = await ChatGroup.find()
            .populate('members', 'name lastName email imageUrl')
            .populate('createdBy', 'name lastName email');
        res.json(groups);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /api/chat/groups
// Creates a new chat group
const createGroup = async (req, res) => {
    try {
        const { name, createdBy, description } = req.body;
        const creatorId = req.user ? req.user.id : createdBy;

        if (!name || !creatorId) {
            return res.status(400).json({ success: false, message: 'Group name and creator ID are required' });
        }

        const group = await ChatGroup.create({
            name,
            description,
            createdBy: creatorId,
            members: [creatorId] // Add creator to the members list initially
        });

        const populatedGroup = await ChatGroup.findById(group._id)
            .populate('members', 'name lastName email imageUrl')
            .populate('createdBy', 'name lastName email');

        res.status(201).json(populatedGroup);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /api/chat/groups/:groupId/join
// Joins a group chat
const joinGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { userId } = req.body;
        const finalUserId = req.user ? req.user.id : userId;

        if (!finalUserId) {
            return res.status(400).json({ success: false, message: 'User ID is required' });
        }

        const group = await ChatGroup.findById(groupId);
        if (!group) {
            return res.status(404).json({ success: false, message: 'Group not found' });
        }

        // Check if user is already a member
        const isMember = group.members.some(member => member.toString() === finalUserId.toString());
        if (isMember) {
            return res.json({ success: true, message: 'Already joined' });
        }

        group.members.push(finalUserId);
        await group.save();

        res.json({ success: true, message: 'Joined group successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /api/chat/groups/exit
// Exits a group chat
const exitGroup = async (req, res) => {
    try {
        const { groupId, userId } = req.body;
        const finalUserId = req.user ? req.user.id : userId;

        if (!groupId || !finalUserId) {
            return res.status(400).json({ success: false, message: 'Group ID and User ID are required' });
        }

        const group = await ChatGroup.findById(groupId);
        if (!group) {
            return res.status(404).json({ success: false, message: 'Group not found' });
        }

        group.members = group.members.filter(m => m.toString() !== finalUserId.toString());
        await group.save();

        res.json({ success: true, message: 'Exited group successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/searchchat/groups/:groupId/members
// Returns member profile objects of a group
const getGroupMembers = async (req, res) => {
    try {
        const { groupId } = req.params;
        const group = await ChatGroup.findById(groupId).populate('members', 'name lastName email imageUrl');
        if (!group) {
            return res.status(404).json({ success: false, message: 'Group not found' });
        }
        res.json(group.members);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/chat/groups/:groupId/messages
// Returns group message history
const getGroupMessages = async (req, res) => {
    try {
        const { groupId } = req.params;
        const messages = await GroupMessage.find({ groupId })
            .populate('senderId', 'name lastName email')
            .sort({ createdAt: 1 });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// PUT /api/chat/group/edit/:id
// Edits group message content
const editGroupMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const newContent = typeof req.body === 'string' ? req.body : req.body.content;

        const message = await GroupMessage.findById(id);
        if (!message) {
            return res.status(404).json({ success: false, message: 'Message not found' });
        }

        if (req.user && message.senderId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to edit this message' });
        }

        message.content = newContent;
        await message.save();
        res.json(message);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// DELETE /api/chat/group/delete/:id
// Deletes a group message
const deleteGroupMessage = async (req, res) => {
    try {
        const { id } = req.params;

        const message = await GroupMessage.findById(id);
        if (!message) {
            return res.status(404).json({ success: false, message: 'Message not found' });
        }

        if (req.user && message.senderId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this message' });
        }

        await GroupMessage.findByIdAndDelete(id);
        res.json({ success: true, message: 'Message deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getRecentContacts,
    getChatHistory,
    editChatMessage,
    deleteChatMessage,
    searchChatUsers,
    getGroups,
    createGroup,
    joinGroup,
    exitGroup,
    getGroupMembers,
    getGroupMessages,
    editGroupMessage,
    deleteGroupMessage
};
