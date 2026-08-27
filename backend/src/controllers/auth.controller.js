const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const {
    generateAccessToken,
    generateRefreshToken,
    refreshCookieOptions,
} = require('../utils/generateTokens');

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
    try {
        const { name, lastName, email, password, role, profileType, phone, batch, rollNo, department, imageUrl } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
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

        if(!user){
            return res.status(400).json({ success: false, message: 'Invalid user data' });
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
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select('+refreshToken');
        
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        user.refreshToken = refreshToken;
        await user.save();

        res.cookie('refreshToken', refreshToken, refreshCookieOptions);

        res.json(buildAuthResponse(user, accessToken));
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const googleLogin = async (req, res) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({ success: false, message: 'Missing Google credential' });
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
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
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

// POST /api/auth/logout — clears the refresh token both from the cookie and the DB

const logoutUser = async (req, res) => {
    const token = req.cookies?.refreshToken;

    try {
        if(token){
            const decoded = jwt.decode(token); 
            if(decoded?.id){
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
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    googleLogin,
    getMe,
    refreshAccessToken,
    logoutUser,
};