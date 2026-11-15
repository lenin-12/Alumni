const ChatMessage = require('../models/ChatMessage');
const ChatGroup = require('../models/ChatGroup');
const GroupMessage = require('../models/GroupMessage');
const User = require('../models/User');
const AppError = require('../utils/AppError');

const mongoose = require('mongoose');

const getRecentContacts = async (req, res) => {
    const { userId } = req.params;

    if (req.user.id !== userId) {
        throw new AppError('Not authorized to view these contacts', 403);
    }

    const objectId = new mongoose.Types.ObjectId(userId);

    const recentContacts = await ChatMessage.aggregate([
        {
            $match: {
                $or: [{ senderId: objectId }, { receiverId: objectId }]
            }
        },
        { $sort: { createdAt: -1 } },
        {
            $group: {
                _id: {
                    $cond: [
                        { $eq: ["$senderId", objectId] },
                        "$receiverId",
                        "$senderId"
                    ]
                },
                latestMessageCreatedAt: { $first: "$createdAt" }
            }
        },
        { $sort: { latestMessageCreatedAt: -1 } },
        { $limit: 50 },
        {
            $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'contact'
            }
        },
        { $unwind: "$contact" },
        {
            $project: {
                _id: "$contact._id",
                name: "$contact.name",
                lastName: "$contact.lastName",
                email: "$contact.email",
                imageUrl: "$contact.imageUrl",
                role: "$contact.role",
                batch: "$contact.batch",
                department: "$contact.department"
            }
        }
    ]);

    res.json(recentContacts);
};

const getChatHistory = async (req, res) => {
    const { userId, receiverId } = req.params;
    const { limit = 30, before } = req.query;

    if (req.user.id !== userId && req.user.id !== receiverId) {
        throw new AppError('Not authorized to view this conversation', 403);
    }

    const query = {
        $or: [
            { senderId: userId, receiverId: receiverId },
            { senderId: receiverId, receiverId: userId }
        ]
    };

    if (before) {
        query._id = { $lt: before };
    }

    const parsedLimit = parseInt(limit, 10);

    const messages = await ChatMessage.find(query)
        .sort({ _id: -1 })
        .limit(parsedLimit)
        .lean();

    messages.reverse();

    const nextCursor = messages.length > 0 ? messages[0]._id : null;

    res.json({ data: messages, nextCursor });
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

    const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const escapedQuery = escapeRegExp(query);
    const regex = new RegExp(escapedQuery, 'i');

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
    const { limit = 30, before } = req.query;

    const query = { groupId };
    if (before) {
        query._id = { $lt: before };
    }

    const parsedLimit = parseInt(limit, 10);

    const messages = await GroupMessage.find(query)
        .populate('senderId', 'name lastName email')
        .sort({ _id: -1 })
        .limit(parsedLimit)
        .lean();

    messages.reverse();

    const nextCursor = messages.length > 0 ? messages[0]._id : null;

    res.json({ data: messages, nextCursor });
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
