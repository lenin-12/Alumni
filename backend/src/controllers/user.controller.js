const User = require('../models/User');
const UserPoints = require('../models/UserPoints');
const cloudinaryUpload = require('../utils/cloudinaryUpload');
const AppError = require('../utils/AppError');

const getUsers = async (req, res) => {
    let query = { role: 'ALUMNI' };

    if (req.user) {
        query._id = { $ne: req.user.id };
    }

    const users = await User.find(query).select('-password');
    res.json(users);
};

const getUserById = async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
        throw new AppError('User not found', 404);
    }
    res.json(user);
};

const updateProfile = async (req, res) => {
    const { id } = req.params;
    const updates = { ...req.body };

    delete updates.password;
    delete updates.role;
    delete updates.email;
    delete updates.id;
    delete updates._id;

    if (req.file) {
        updates.imageUrl = await cloudinaryUpload(req.file.buffer);
    }

    const user = await User.findByIdAndUpdate(id, updates, { new: true }).select('-password');
    if (!user) {
        throw new AppError('User not found', 404);
    }

    res.json(user);
};

const getLeaderboard = async (req, res) => {
    const userPoints = await UserPoints.find().populate('userId');

    let leaderboardData = userPoints.map(up => {
        if (!up.userId) return null;
        return {
            id: up.userId._id,
            name: up.userId.name + (up.userId.lastName ? ' ' + up.userId.lastName : ''),
            email: up.userId.email,
            batch: up.userId.batch,
            department: up.userId.department,
            imageUrl: up.userId.imageUrl,
            role: up.userId.role,
            points: up.points
        };
    }).filter(item => item !== null);

    if (leaderboardData.length === 0) {
        const alumni = await User.find({ role: 'ALUMNI' });
        leaderboardData = alumni.map(user => ({
            id: user._id,
            name: user.name + (user.lastName ? ' ' + user.lastName : ''),
            email: user.email,
            batch: user.batch,
            department: user.department,
            imageUrl: user.imageUrl,
            role: user.role,
            points: 0
        }));
    }

    leaderboardData.sort((a, b) => b.points - a.points);

    res.json(leaderboardData);
};

const searchUsers = async (req, res) => {
    const { type, query } = req.query;
    if (!query) {
        return res.json([]);
    }

    const regex = new RegExp(query, 'i');
    let searchCriteria = {};

    if (type === 'name') {
        searchCriteria = { $or: [{ name: regex }, { lastName: regex }] };
    } else if (type === 'batch') {
        const batchNum = parseInt(query);
        if (!isNaN(batchNum)) {
            searchCriteria = { batch: batchNum };
        } else {
            return res.json([]);
        }
    } else if (type === 'company') {
        searchCriteria = { company: regex };
    } else {
        searchCriteria = {
            $or: [
                { name: regex },
                { lastName: regex },
                { email: regex },
                { department: regex },
                { company: regex }
            ]
        };
    }

    let roleCriteria = { role: 'ALUMNI' };

    let idCriteria = {};
    if (req.user) {
        idCriteria = { _id: { $ne: req.user.id } };
    }

    const finalCriteria = {
        $and: [
            searchCriteria,
            roleCriteria,
            idCriteria
        ]
    };

    const users = await User.find(finalCriteria).select('-password');
    res.json(users);
};

const getAllUsersForAdmin = async (req, res) => {
    const users = await User.find().select('-password').sort({ name: 1 });
    res.json(users);
};

const promoteToAdmin = async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
        throw new AppError('User not found', 404);
    }

    user.role = 'ADMIN';
    await user.save();

    res.json({ success: true, message: `User ${user.name} promoted to ADMIN successfully`, user });
};

const demoteFromAdmin = async (req, res) => {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
        throw new AppError('User not found', 404);
    }

    if (user.role === 'ADMIN') {
        const adminCount = await User.countDocuments({ role: 'ADMIN' });
        if (adminCount <= 1) {
            throw new AppError('Cannot demote the last remaining ADMIN user.', 400);
        }
    }

    user.role = 'ALUMNI';
    await user.save();

    res.json({ success: true, message: `User ${user.name} demoted to ALUMNI successfully`, user });
};

const getUserPoints = async (req, res) => {
    const { id } = req.params;
    const userPoints = await UserPoints.findOne({ userId: id });
    res.json({ points: userPoints ? userPoints.points : 0 });
};

module.exports = {
    getUsers,
    getUserById,
    updateProfile,
    getLeaderboard,
    searchUsers,
    getAllUsersForAdmin,
    promoteToAdmin,
    demoteFromAdmin,
    getUserPoints
};
