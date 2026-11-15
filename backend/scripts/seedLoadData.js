require('dotenv').config();
const mongoose = require('mongoose');
const crypto = require('crypto');

// Models
const User = require('../src/models/User');
const ChatMessage = require('../src/models/ChatMessage');
const GroupMessage = require('../src/models/GroupMessage');
const Connection = require('../src/models/Connection');
const Achievement = require('../src/models/Achievement');
const JobOpportunity = require('../src/models/JobOpportunity');
const ChatGroup = require('../src/models/ChatGroup');
const UserPoints = require('../src/models/UserPoints');
const WorkExperience = require('../src/models/WorkExperience');

const parseEnvInt = (key, defaultVal) => process.env[key] ? parseInt(process.env[key], 10) : defaultVal;

const NUM_USERS = parseEnvInt('SEED_USERS', 50000);
const NUM_CHAT_MESSAGES = parseEnvInt('SEED_CHAT_MESSAGES', 300000);
const NUM_GROUP_MESSAGES = parseEnvInt('SEED_GROUP_MESSAGES', 50000);
const NUM_CONNECTIONS = parseEnvInt('SEED_CONNECTIONS', 100000);
const NUM_ACHIEVEMENTS = parseEnvInt('SEED_ACHIEVEMENTS', 50000);
const BATCH_SIZE = 5000;

const randomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomString = () => crypto.randomBytes(4).toString('hex');

const run = async () => {
    const devUri = process.env.MONGO_URI;
    const benchUri = process.env.MONGO_URI_BENCH;

    if (!benchUri) {
        console.error("MONGO_URI_BENCH is not set.");
        process.exit(1);
    }
    if (benchUri === devUri) {
        console.error("MONGO_URI_BENCH must not equal dev MONGO_URI.");
        process.exit(1);
    }

    await mongoose.connect(benchUri);
    console.log(`Connected to benchmark DB: ${benchUri}`);

    console.log("Clearing existing data...");
    await Promise.all([
        User.deleteMany({}), ChatMessage.deleteMany({}), GroupMessage.deleteMany({}),
        Connection.deleteMany({}), Achievement.deleteMany({}), JobOpportunity.deleteMany({}),
        ChatGroup.deleteMany({}), UserPoints.deleteMany({}), WorkExperience.deleteMany({})
    ]);

    console.log(`Seeding ${NUM_USERS} Users...`);
    const userIds = [];
    for (let i = 0; i < NUM_USERS; i += BATCH_SIZE) {
        const batchSize = Math.min(BATCH_SIZE, NUM_USERS - i);
        const batch = [];
        for (let j = 0; j < batchSize; j++) {
            const uId = new mongoose.Types.ObjectId();
            userIds.push(uId);
            batch.push({
                _id: uId,
                name: `User${i+j}`,
                lastName: `Last${i+j}`,
                email: `user${i+j}_${randomString()}@test.com`,
                password: 'password', // not hashed for speed
                role: randomElement(['ALUMNI', 'STUDENT']),
                batch: 2020 + (i % 4),
                company: `Company${i % 10}`
            });
        }
        await User.insertMany(batch);
        console.log(` Inserted ${i + batchSize} Users`);
    }

    if (userIds.length > 0) {
        console.log(`Seeding ${NUM_CHAT_MESSAGES} ChatMessages...`);
        for (let i = 0; i < NUM_CHAT_MESSAGES; i += BATCH_SIZE) {
            const batchSize = Math.min(BATCH_SIZE, NUM_CHAT_MESSAGES - i);
            const batch = [];
            for (let j = 0; j < batchSize; j++) {
                batch.push({
                    senderId: randomElement(userIds),
                    receiverId: randomElement(userIds),
                    content: `Message ${i+j}`,
                    createdAt: new Date(Date.now() - Math.random() * 10000000000)
                });
            }
            await ChatMessage.insertMany(batch);
            console.log(` Inserted ${i + batchSize} ChatMessages`);
        }

        console.log(`Seeding 1 ChatGroup...`);
        const groupId = new mongoose.Types.ObjectId();
        await ChatGroup.create({ _id: groupId, name: 'General', members: userIds.slice(0, 50), createdBy: userIds[0] });

        console.log(`Seeding ${NUM_GROUP_MESSAGES} GroupMessages...`);
        for (let i = 0; i < NUM_GROUP_MESSAGES; i += BATCH_SIZE) {
            const batchSize = Math.min(BATCH_SIZE, NUM_GROUP_MESSAGES - i);
            const batch = [];
            for (let j = 0; j < batchSize; j++) {
                batch.push({
                    groupId: groupId,
                    senderId: randomElement(userIds),
                    content: `Group message ${i+j}`,
                    createdAt: new Date(Date.now() - Math.random() * 10000000000)
                });
            }
            await GroupMessage.insertMany(batch);
            console.log(` Inserted ${i + batchSize} GroupMessages`);
        }

        console.log(`Seeding ${NUM_CONNECTIONS} Connections...`);
        const connectionPairs = new Set();
        for (let i = 0; i < NUM_CONNECTIONS; i += BATCH_SIZE) {
            const batchSize = Math.min(BATCH_SIZE, NUM_CONNECTIONS - i);
            const batch = [];
            let added = 0;
            while(added < batchSize) {
                const reqId = randomElement(userIds);
                const recId = randomElement(userIds);
                if(reqId === recId) continue;
                const key = `${reqId}_${recId}`;
                if (!connectionPairs.has(key)) {
                    connectionPairs.add(key);
                    batch.push({
                        requesterId: reqId,
                        recipientId: recId,
                        status: randomElement(['PENDING', 'ACCEPTED'])
                    });
                    added++;
                }
            }
            await Connection.insertMany(batch);
            console.log(` Inserted ${i + batchSize} Connections`);
        }

        console.log(`Seeding ${NUM_ACHIEVEMENTS} Achievements...`);
        for (let i = 0; i < NUM_ACHIEVEMENTS; i += BATCH_SIZE) {
            const batchSize = Math.min(BATCH_SIZE, NUM_ACHIEVEMENTS - i);
            const batch = [];
            for (let j = 0; j < batchSize; j++) {
                batch.push({
                    userId: randomElement(userIds),
                    title: `Achievement ${i+j}`,
                    description: 'Description',
                    dateOfAchievement: new Date(Date.now() - Math.random() * 10000000000)
                });
            }
            await Achievement.insertMany(batch);
            console.log(` Inserted ${i + batchSize} Achievements`);
        }
        
        console.log(`Seeding 10000 JobOpportunities...`);
        for (let i = 0; i < 10000; i += BATCH_SIZE) {
            const batchSize = Math.min(BATCH_SIZE, 10000 - i);
            const batch = [];
            for (let j = 0; j < batchSize; j++) {
                batch.push({
                    postedBy: randomElement(userIds),
                    title: `Job ${i+j}`,
                    company: `Company ${i % 20}`,
                    description: 'Description',
                    location: 'Remote',
                    createdAt: new Date(Date.now() - Math.random() * 10000000000)
                });
            }
            await JobOpportunity.insertMany(batch);
        }
        
        console.log(`Seeding UserPoints for ${userIds.length} users...`);
        for (let i = 0; i < userIds.length; i += BATCH_SIZE) {
            const batchSize = Math.min(BATCH_SIZE, userIds.length - i);
            const batch = [];
            for (let j = 0; j < batchSize; j++) {
                batch.push({
                    userId: userIds[i+j],
                    points: Math.floor(Math.random() * 1000)
                });
            }
            await UserPoints.insertMany(batch);
        }
        
        console.log(`Seeding 10000 WorkExperiences...`);
        for (let i = 0; i < 10000; i += BATCH_SIZE) {
            const batchSize = Math.min(BATCH_SIZE, 10000 - i);
            const batch = [];
            for (let j = 0; j < batchSize; j++) {
                batch.push({
                    userId: randomElement(userIds),
                    company: `Work Company ${i % 20}`,
                    role: 'Dev',
                    startDate: new Date(Date.now() - Math.random() * 10000000000)
                });
            }
            await WorkExperience.insertMany(batch);
        }
    }

    console.log("Seeding complete!");
    process.exit(0);
};

run().catch(err => {
    console.error(err);
    process.exit(1);
});
