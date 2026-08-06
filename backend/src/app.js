const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use((req, res, next) => {
    const header = req.headers.cookie;
    req.cookies = {};
    if (header) {
        header.split(';').forEach((pair) => {
            const index = pair.indexOf('=');
            if (index > -1) {
                const key = pair.slice(0, index).trim();
                const value = decodeURIComponent(pair.slice(index + 1).trim());
                req.cookies[key] = value;
            }
        });
    }
    next();
});
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Alumni Network API' });
});

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const jobRoutes = require('./routes/job.routes');
const connectionRoutes = require('./routes/connection.routes');
const eventRoutes = require('./routes/event.routes');
const galleryRoutes = require('./routes/gallery.routes');
const contactRoutes = require('./routes/contact.routes');
const chatRoutes = require('./routes/chat.routes');
const searchChatRoutes = require('./routes/searchchat.routes');
const workExperienceRoutes = require('./routes/workexperience.routes');
const achievementRoutes = require('./routes/achievement.routes');
const alumniRoutes = require('./routes/alumni.routes');
const emailRoutes = require('./routes/email.routes');


app.use('/api/auth', authRoutes);

app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/searchchat', searchChatRoutes);
app.use('/api/work-experience', workExperienceRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/alumni', alumniRoutes);
app.use('/api/email', emailRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);

    if (err.name === 'MulterError') {
        let message = err.message;
        if (err.code === 'LIMIT_FILE_SIZE') {
            message = 'File too large. Maximum size allowed is 5MB.';
        }
        return res.status(400).json({
            success: false,
            message: message
        });
    }

    if (err.message && err.message.includes('Only image files are allowed')) {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }

    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Internal Server Error',
    });
});

module.exports = app;