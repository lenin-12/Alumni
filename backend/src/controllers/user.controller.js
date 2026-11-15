const User = require('../models/User');
const UserPoints = require('../models/UserPoints');
const cloudinaryUpload = require('../utils/cloudinaryUpload');
const AppError = require('../utils/AppError');
const { parsePaginationParams, buildPaginatedResponse } = require('../utils/pagination');
const { getOrSet, getVersion, buildKey, entityKey } = require('../utils/cache');
const { invalidateUser, invalidateAlumniList } = require('../utils/cacheInvalidation');

// Version key names — shared with cacheInvalidation.js
const LEADERBOARD_VER_KEY = 'ver:leaderboard';
const ALUMNI_LIST_VER_KEY  = 'ver:alumni_list';

const getUsers = async (req, res) => {
    let baseQuery = { role: 'ALUMNI' };
    const { page, limit, skip } = parsePaginationParams(req);

    // Cache the full alumni list keyed by version+page+limit.
    // We purposely do NOT key by req.user.id — instead we cache the full set
    // and exclude the requesting user in-memory after retrieval.
    const version = await getVersion(ALUMNI_LIST_VER_KEY);
    const cacheKey = buildKey('alumni', version, `p${page}:l${limit}`);

    const result = await getOrSet(cacheKey, 120, async () => {
        const [users, total] = await Promise.all([
            User.find(baseQuery).select('-password').skip(skip).limit(limit).lean(),
            User.countDocuments(baseQuery)
        ]);
        return buildPaginatedResponse(users, page, limit, total);
    });

    // Remove requesting user from the cached data in-memory (so key stays per-page, not per-user)
    if (req.user) {
        const reqUserId = req.user._id?.toString() || req.user.id?.toString();
        result.data = result.data.filter(u => u._id?.toString() !== reqUserId);
    }

    res.json(result);
};

const getUserById = async (req, res) => {
    const user = await User.findById(req.params.id).select('-password').lean();
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

    await invalidateUser(id);
    await invalidateAlumniList();

    res.json(user);
};

const getLeaderboard = async (req, res) => {
    const { limit = 50 } = req.query;
    const topLimit = parseInt(limit, 10) || 50;

    const version = await getVersion(LEADERBOARD_VER_KEY);
    const cacheKey = buildKey('leaderboard', version, `n${topLimit}`);

    const leaderboardData = await getOrSet(cacheKey, 60, async () => {
        const userPoints = await UserPoints.find()
            .sort({ points: -1 })
            .limit(topLimit)
            .populate('userId', 'name lastName email batch department imageUrl role')
            .lean();

        let data = userPoints.map(up => {
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

        if (data.length === 0) {
            const alumni = await User.find({ role: 'ALUMNI' }).limit(topLimit).lean();
            data = alumni.map(user => ({
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

        return data;
    });

    res.json({ data: leaderboardData });
};

const searchUsers = async (req, res) => {
    const { type, query } = req.query;
    const { page, limit, skip } = parsePaginationParams(req);

    if (!query) {
        return res.json(buildPaginatedResponse([], page, limit, 0));
    }

    const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const escapedQuery = escapeRegExp(query);
    const regex = new RegExp(escapedQuery, 'i');
    let searchCriteria = {};

    if (type === 'name') {
        searchCriteria = { $or: [{ name: regex }, { lastName: regex }] };
    } else if (type === 'batch') {
        const batchNum = parseInt(query);
        if (!isNaN(batchNum)) {
            searchCriteria = { batch: batchNum };
        } else {
            return res.json(buildPaginatedResponse([], page, limit, 0));
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

    // Cache search results keyed by version + normalized query params.
    // Exclude requesting user in-memory after retrieval (same pattern as getUsers).
    const version = await getVersion(ALUMNI_LIST_VER_KEY);
    const normalizedType = type || 'all';
    const normalizedQuery = escapedQuery.toLowerCase();
    const cacheKey = buildKey('search', version, `t${normalizedType}:q${normalizedQuery}:p${page}:l${limit}`);

    const result = await getOrSet(cacheKey, 120, async () => {
        const roleCriteria = { role: 'ALUMNI' };
        const finalCriteria = { $and: [searchCriteria, roleCriteria] };

        const [users, total] = await Promise.all([
            User.find(finalCriteria).select('-password').skip(skip).limit(limit).lean(),
            User.countDocuments(finalCriteria)
        ]);
        return buildPaginatedResponse(users, page, limit, total);
    });

    // Remove the requesting user in-memory
    if (req.user) {
        const reqUserId = req.user._id?.toString() || req.user.id?.toString();
        result.data = result.data.filter(u => u._id?.toString() !== reqUserId);
    }

    res.json(result);
};

const getAllUsersForAdmin = async (req, res) => {
    const { page, limit, skip } = parsePaginationParams(req);
    const [users, total] = await Promise.all([
        User.find().select('-password').sort({ name: 1 }).skip(skip).limit(limit).lean(),
        User.countDocuments()
    ]);
    res.json(buildPaginatedResponse(users, page, limit, total));
};

const promoteToAdmin = async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
        throw new AppError('User not found', 404);
    }

    user.role = 'ADMIN';
    await user.save();

    await invalidateUser(id);
    await invalidateAlumniList();

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

    await invalidateUser(id);
    await invalidateAlumniList();

    res.json({ success: true, message: `User ${user.name} demoted to ALUMNI successfully`, user });
};

const getUserPoints = async (req, res) => {
    const { id } = req.params;
    const cacheKey = entityKey('points', id);

    const points = await getOrSet(cacheKey, 60, async () => {
        const up = await UserPoints.findOne({ userId: id }).lean();
        return up ? up.points : 0;
    });

    res.json({ points });
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
