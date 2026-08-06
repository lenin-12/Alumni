const User = require('../models/User');
const UserPoints = require('../models/UserPoints');
const cloudinaryUpload = require('../utils/cloudinaryUpload');

// Get all users/alumni
const getUsers = async (req, res) => {
    try {
        // Exclude admins from the main directory and filter by logged-in user role
        let query = { role: { $ne: 'ADMIN' } };
        if (req.user && req.user.role === 'ALUMNI') {
            query = { role: 'ALUMNI' };
        }
        
        // Exclude the logged-in user themselves
        if (req.user) {
            query._id = { $ne: req.user.id };
        }
        
        const users = await User.find(query).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get single user by ID
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update user profile details
const updateProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = { ...req.body };
        
        // Remove critical fields from request body to prevent unauthorized modification
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
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        res.json(user);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Leaderboard rankings
const getLeaderboard = async (req, res) => {
    try {
        // Query points and populate user info
        const userPoints = await UserPoints.find().populate('userId');
        
        // Map user info to response structure expected by frontend
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
        
        // If there are no rankings yet, query users and build a default 0-point ranking
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
        
        // Sort descending by points
        leaderboardData.sort((a, b) => b.points - a.points);
        
        res.json(leaderboardData);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Search users by name, batch, company or general query
const searchUsers = async (req, res) => {
    try {
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
            // General text match
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
        
        // Exclude ADMIN users and filter based on user role
        let roleCriteria = { role: { $ne: 'ADMIN' } };
        if (req.user && req.user.role === 'ALUMNI') {
            roleCriteria = { role: 'ALUMNI' };
        }
        
        // Exclude the logged-in user themselves
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
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all users (including admins) for Admin Management page
const getAllUsersForAdmin = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ name: 1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Promote a user to ADMIN
const promoteToAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        user.role = 'ADMIN';
        await user.save();
        
        res.json({ success: true, message: `User ${user.name} promoted to ADMIN successfully`, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// Demote an ADMIN to ALUMNI
const demoteFromAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Validate that the system has at least one remaining ADMIN before demoting
        if (user.role === 'ADMIN') {
            const adminCount = await User.countDocuments({ role: 'ADMIN' });
            if (adminCount <= 1) {
                return res.status(400).json({ success: false, message: 'Cannot demote the last remaining ADMIN user.' });
            }
        }

        user.role = 'ALUMNI'; // demote to ALUMNI
        await user.save();

        res.json({ success: true, message: `User ${user.name} demoted to ALUMNI successfully`, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get points of a user
const getUserPoints = async (req, res) => {
    try {
        const { id } = req.params;
        const userPoints = await UserPoints.findOne({ userId: id });
        res.json({ points: userPoints ? userPoints.points : 0 });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
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
