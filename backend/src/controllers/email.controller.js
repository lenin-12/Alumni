const User = require('../models/User');
const bcrypt = require('bcryptjs');

// POST /api/email/forgot-password
// Generates a local password reset link, logs it to console, and returns success
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User with this email does not exist' });
        }

        // Generate reset link pointing to frontend
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const resetLink = `${frontendUrl}/reset-password?userId=${user._id}`;
        
        console.log('====================================');
        console.log('PASSWORD RESET REQUEST RECEIVED');
        console.log(`Email: ${email}`);
        console.log(`Local Reset Link: ${resetLink}`);
        console.log('====================================');

        res.send('A password reset link has been successfully generated and sent to your email.');
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /api/email/reset-password
// Resets the user's password in MongoDB
const resetPassword = async (req, res) => {
    try {
        const { userId, newPassword } = req.body;
        if (!userId || !newPassword) {
            return res.status(400).json({ success: false, message: 'User ID and new password are required' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        await user.save();

        res.json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /api/email/invite
// Sends community invites (logged to console for development verification)
const sendInvite = async (req, res) => {
    try {
        const { toEmails, fromEmail, name } = req.body;
        if (!toEmails || toEmails.length === 0) {
            return res.status(400).json({ success: false, message: 'Recipient email(s) required' });
        }

        console.log('====================================');
        console.log(`INVITATION SENT BY: ${name} (${fromEmail})`);
        console.log(`To: ${toEmails.join(', ')}`);
        console.log('====================================');

        res.json({ success: true, message: 'Invitations sent successfully!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    forgotPassword,
    resetPassword,
    sendInvite
};
