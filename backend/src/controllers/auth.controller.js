const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const {
    generateAccessToken,
    generateRefreshToken,
    refreshCookieOptions,
} = require('../utils/generateTokens');
const AppError = require('../utils/AppError');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const buildAuthResponse = (user, accessToken) => ({
    success: true,
    id: user.id,
    name: user.name,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    imageUrl: user.imageUrl,
    batch: user.batch,
    rollNo: user.rollNo,
    department: user.department,
    phone: user.phone,
    profileType: user.profileType,
    token: accessToken,
});

const registerUser = async (req, res) => {
    const { name, lastName, email, password, role, profileType, phone, batch, rollNo, department, imageUrl } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
        throw new AppError('User already exists', 400);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
        name,
        lastName,
        email,
        password: hashedPassword,
        role: role || 'ALUMNI',
        profileType: profileType || 'PUBLIC',
        phone,
        batch: batch ? parseInt(batch) : undefined,
        rollNo,
        department,
        imageUrl,
    });

    if (!user) {
        throw new AppError('Invalid user data', 400);
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('refreshToken', refreshToken, refreshCookieOptions);

    res.status(201).json({
        success: true,
        _id: user.id,
        name: user.name,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        token: accessToken,
    });
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+refreshToken');

    if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new AppError('Invalid credentials', 401);
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('refreshToken', refreshToken, refreshCookieOptions);

    res.json(buildAuthResponse(user, accessToken));
};

const googleLogin = async (req, res) => {
    const { credential } = req.body;

    if (!credential) {
        throw new AppError('Missing Google credential', 400);
    }

    const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, given_name: firstName, family_name: lastName, picture: imageUrl } = payload;

    const user = await User.findOne({ email }).select('+refreshToken');

    if (!user) {
        return res.json({
            success: true,
            newUser: true,
            email,
            firstName,
            lastName,
            imageUrl,
        });
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('refreshToken', refreshToken, refreshCookieOptions);

    res.json({
        success: true,
        newUser: false,
        user: {
            id: user.id,
            name: user.name,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            imageUrl: user.imageUrl,
            batch: user.batch,
            rollNo: user.rollNo,
            department: user.department,
            phone: user.phone,
            profileType: user.profileType,
        },
        token: accessToken,
    });
};

const refreshAccessToken = async (req, res) => {
    const token = req.cookies?.refreshToken;

    if (!token) {
        return res.status(401).json({ success: false, message: 'No refresh token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.id).select('+refreshToken');

        if (!user || user.refreshToken !== token) {
            res.clearCookie('refreshToken', refreshCookieOptions);
            return res.status(403).json({ success: false, message: 'Refresh token invalid or reused' });
        }

        const newAccessToken = generateAccessToken(user.id);
        const newRefreshToken = generateRefreshToken(user.id);

        user.refreshToken = newRefreshToken;
        await user.save();

        res.cookie('refreshToken', newRefreshToken, refreshCookieOptions);

        res.json({ success: true, token: newAccessToken });
    } catch (error) {
        res.clearCookie('refreshToken', refreshCookieOptions);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Refresh token expired, please log in again' });
        }
        return res.status(403).json({ success: false, message: 'Invalid refresh token' });
    }
};

const logoutUser = async (req, res) => {
    const token = req.cookies?.refreshToken;

    try {
        if (token) {
            const decoded = jwt.decode(token);
            if (decoded?.id) {
                await User.findByIdAndUpdate(decoded.id, { refreshToken: null });
            }
        }
    } catch (error) {
        // Even if decoding fails, still clear the cookie below
    }

    res.clearCookie('refreshToken', refreshCookieOptions);
    res.json({ success: true, message: 'Logged out' });
};

const getMe = async (req, res) => {
    const user = await User.findById(req.user.id).select('-password');
    res.json({ success: true, user });
};

module.exports = {
    registerUser,
    loginUser,
    googleLogin,
    getMe,
    refreshAccessToken,
    logoutUser,
};
