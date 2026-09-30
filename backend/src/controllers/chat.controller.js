const ChatMessage = require('../models/ChatMessage');
const ChatGroup = require('../models/ChatGroup');
const GroupMessage = require('../models/GroupMessage');
const User = require('../models/User');
const AppError = require('../utils/AppError');

const getRecentContacts = async (req, res) => {
    const { userId } = req.params;

    if (req.user.id !== userId) {
        throw new AppError('Not authorized to view these contacts', 403);
    }

    const messages = await ChatMessage.find({
        $or: [{ senderId: userId }, { receiverId: userId }]
    }).sort({ createdAt: -1 });

    const contactIds = new Set();
    messages.forEach(msg => {
        if (msg.senderId.toString() !== userId) {
            contactIds.add(msg.senderId.toString());
        }
        if (msg.receiverId.toString() !== userId) {
            contactIds.add(msg.receiverId.toString());
        }
    });

    const contacts = await User.find({ _id: { $in: Array.from(contactIds) } })
        .select('name lastName email imageUrl role batch department');

    res.json(contacts);
};

const getChatHistory = async (req, res) => {
    const { userId, receiverId } = req.params;

    if (req.user.id !== userId && req.user.id !== receiverId) {
        throw new AppError('Not authorized to view this conversation', 403);
    }

    const messages = await ChatMessage.find({
        $or: [
            { senderId: userId, receiverId: receiverId },
            { senderId: receiverId, receiverId: userId }
        ]
    }).sort({ createdAt: 1 });

    res.json(messages);
};

const editChatMessage = async (req, res) => {
    const { id } = req.params;
    const newContent = typeof req.body === 'string' ? req.body : req.body.content;

    const message = await ChatMessage.findById(id);
    if (!message) {
        throw new AppError('Message not found', 404);
    }

    if (req.user && message.senderId.toString() !== req.user.id) {
        throw new AppError('Not authorized to edit this message', 403);
    }

    message.content = newContent;
    await message.save();
    res.json(message);
};

const deleteChatMessage = async (req, res) => {
    const { id } = req.params;

    const message = await ChatMessage.findById(id);
    if (!message) {
        throw new AppError('Message not found', 404);
    }

    if (req.user && message.senderId.toString() !== req.user.id) {
        throw new AppError('Not authorized to delete this message', 403);
    }

    await ChatMessage.findByIdAndDelete(id);
    res.json({ success: true, message: 'Message deleted successfully' });
};

const searchChatUsers = async (req, res) => {
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
};

const getGroups = async (req, res) => {
    const groups = await ChatGroup.find()
        .populate('members', 'name lastName email imageUrl')
        .populate('createdBy', 'name lastName email');
    res.json(groups);
};

const createGroup = async (req, res) => {
    const { name, createdBy, description } = req.body;
    const creatorId = req.user ? req.user.id : createdBy;

    if (!name || !creatorId) {
        throw new AppError('Group name and creator ID are required', 400);
    }

    const group = await ChatGroup.create({
        name,
        description,
        createdBy: creatorId,
        members: [creatorId]
    });

    const populatedGroup = await ChatGroup.findById(group._id)
        .populate('members', 'name lastName email imageUrl')
        .populate('createdBy', 'name lastName email');

    res.status(201).json(populatedGroup);
};

const joinGroup = async (req, res) => {
    const { groupId } = req.params;
    const { userId } = req.body;
    const finalUserId = req.user ? req.user.id : userId;

    if (!finalUserId) {
        throw new AppError('User ID is required', 400);
    }

    const group = await ChatGroup.findById(groupId);
    if (!group) {
        throw new AppError('Group not found', 404);
    }

    const isMember = group.members.some(member => member.toString() === finalUserId.toString());
    if (isMember) {
        return res.json({ success: true, message: 'Already joined' });
    }

    group.members.push(finalUserId);
    await group.save();

    res.json({ success: true, message: 'Joined group successfully' });
};

const exitGroup = async (req, res) => {
    const { groupId, userId } = req.body;
    const finalUserId = req.user ? req.user.id : userId;

    if (!groupId || !finalUserId) {
        throw new AppError('Group ID and User ID are required', 400);
    }

    const group = await ChatGroup.findById(groupId);
    if (!group) {
        throw new AppError('Group not found', 404);
    }

    group.members = group.members.filter(m => m.toString() !== finalUserId.toString());
    await group.save();

    res.json({ success: true, message: 'Exited group successfully' });
};

const getGroupMembers = async (req, res) => {
    const { groupId } = req.params;
    const group = await ChatGroup.findById(groupId).populate('members', 'name lastName email imageUrl');
    if (!group) {
        throw new AppError('Group not found', 404);
    }
    res.json(group.members);
};

const getGroupMessages = async (req, res) => {
    const { groupId } = req.params;
    const messages = await GroupMessage.find({ groupId })
        .populate('senderId', 'name lastName email')
        .sort({ createdAt: 1 });
    res.json(messages);
};

const editGroupMessage = async (req, res) => {
    const { id } = req.params;
    const newContent = typeof req.body === 'string' ? req.body : req.body.content;

    const message = await GroupMessage.findById(id);
    if (!message) {
        throw new AppError('Message not found', 404);
    }

    if (req.user && message.senderId.toString() !== req.user.id) {
        throw new AppError('Not authorized to edit this message', 403);
    }

    message.content = newContent;
    await message.save();
    res.json(message);
};

const deleteGroupMessage = async (req, res) => {
    const { id } = req.params;

    const message = await GroupMessage.findById(id);
    if (!message) {
        throw new AppError('Message not found', 404);
    }

    if (req.user && message.senderId.toString() !== req.user.id) {
        throw new AppError('Not authorized to delete this message', 403);
    }

    await GroupMessage.findByIdAndDelete(id);
    res.json({ success: true, message: 'Message deleted successfully' });
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
