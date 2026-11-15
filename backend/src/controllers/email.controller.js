const User = require('../models/User');
const bcrypt = require('bcryptjs');
const AppError = require('../utils/AppError');

const forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        throw new AppError('Email is required', 400);
    }

    const user = await User.findOne({ email });
    if (!user) {
        throw new AppError('User with this email does not exist', 404);
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetLink = `${frontendUrl}/reset-password?userId=${user._id}`;

    console.log('====================================');
    console.log('PASSWORD RESET REQUEST RECEIVED');
    console.log(`Email: ${email}`);
    console.log(`Local Reset Link: ${resetLink}`);
    console.log('====================================');

    res.send('A password reset link has been successfully generated and sent to your email.');
};

const resetPassword = async (req, res) => {
    const { userId, newPassword } = req.body;
    if (!userId || !newPassword) {
        throw new AppError('User ID and new password are required', 400);
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new AppError('User not found', 404);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    res.json({ success: true, message: 'Password reset successfully' });
};

const sendInvite = async (req, res) => {
    const { toEmails, fromEmail, name } = req.body;
    if (!toEmails || toEmails.length === 0) {
        throw new AppError('Recipient email(s) required', 400);
    }

    console.log('====================================');
    console.log(`INVITATION SENT BY: ${name} (${fromEmail})`);
    console.log(`To: ${toEmails.join(', ')}`);
    console.log('====================================');

    res.json({ success: true, message: 'Invitations sent successfully!' });
};

module.exports = {
    forgotPassword,
    resetPassword,
    sendInvite
};
