const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI;
const User = require('../src/models/User');

const seedAdmin = async () => {
    try {
        if (!MONGO_URI) {
            console.error('MONGO_URI is not set in environment variables');
            process.exit(1);
        }

        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected to DB successfully!');

        // Check if an ADMIN already exists
        const adminExists = await User.findOne({ role: 'ADMIN' });
        if (adminExists) {
            console.log('An ADMIN user already exists in the database. Exiting seed script safely.');
            console.log(`Admin name :${adminExists.name}`);
            mongoose.connection.close();
            process.exit(0);
        }

        const email = process.env.ADMIN_EMAIL || 'admin@nitkkr.ac.in';
        const password = process.env.ADMIN_PASSWORD || 'Admin@123';

        console.log(`Seeding initial ADMIN account with email: ${email}...`);

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await User.create({
            name: 'Lenin',
            lastName: 'Kumar',
            email: email,
            password: hashedPassword,
            role: 'ADMIN',
            profileType: 'PUBLIC',
            department: 'Computer Science and Engineering',
            batch: 2023,
            imageUrl: 'https://res.cloudinary.com/dcsomu9n6/image/upload/v1742667126/qkeb6zjwjoyygy4w51bz.webp'
        });

        console.log('ADMIN user seeded successfully!');
        mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error seeding ADMIN user:', error);
        mongoose.connection.close();
        process.exit(1);
    }
};

seedAdmin();
