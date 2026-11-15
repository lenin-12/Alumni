require('dotenv').config();
const mongoose = require('mongoose');

const User = require('../src/models/User');
const ChatMessage = require('../src/models/ChatMessage');
const GroupMessage = require('../src/models/GroupMessage');
const Connection = require('../src/models/Connection');
const Achievement = require('../src/models/Achievement');
const JobOpportunity = require('../src/models/JobOpportunity');
const ChatGroup = require('../src/models/ChatGroup');
const UserPoints = require('../src/models/UserPoints');
const WorkExperience = require('../src/models/WorkExperience');

const runBenchmark = async () => {
    const benchUri = process.env.MONGO_URI_BENCH;
    await mongoose.connect(benchUri);

    const user = await User.findOne({});
    const user2 = await User.findOne({ _id: { $ne: user._id } });
    const groupId = (await ChatGroup.findOne({}))?._id || new mongoose.Types.ObjectId();
    const userId = user?._id || new mongoose.Types.ObjectId();
    const user2Id = user2?._id || new mongoose.Types.ObjectId();

    const queries = [
        { model: ChatMessage, name: 'ChatMessage history', query: { senderId: userId, receiverId: user2Id }, sort: { createdAt: 1 } },
        { model: ChatMessage, name: 'ChatMessage recent', query: { $or: [{ senderId: userId }, { receiverId: userId }] }, sort: { createdAt: -1 } },
        { model: GroupMessage, name: 'GroupMessage', query: { groupId: groupId }, sort: { createdAt: 1 } },
        { model: Connection, name: 'Connection requester', query: { requesterId: userId, status: 'ACCEPTED' } },
        { model: Connection, name: 'Connection recipient', query: { recipientId: userId, status: 'ACCEPTED' } },
        { model: Connection, name: 'Connection unique check', query: { requesterId: userId, recipientId: user2Id } },
        { model: Achievement, name: 'Achievement by User', query: { userId: userId }, sort: { dateOfAchievement: -1 } },
        { model: Achievement, name: 'Achievement feed', query: {}, sort: { dateOfAchievement: -1 } },
        { model: WorkExperience, name: 'WorkExperience by User', query: { userId: userId } },
        { model: User, name: 'User by role, batch', query: { role: 'ALUMNI', batch: 2020 } },
        { model: User, name: 'User by role, company', query: { role: 'ALUMNI', company: 'Company1' } },
        { model: JobOpportunity, name: 'JobOpportunity feed', query: {}, sort: { createdAt: -1 } },
        { model: ChatGroup, name: 'ChatGroup members', query: { members: userId } },
        { model: UserPoints, name: 'UserPoints leaderboard', query: {}, sort: { points: -1 } }
    ];

    const results = [];

    const measure = async (stage) => {
        for (const q of queries) {
            let mQuery = q.model.find(q.query);
            if (q.sort) mQuery = mQuery.sort(q.sort);
            const stats = await mQuery.explain('executionStats');
            const exStats = stats.executionStats || stats[0]?.executionStats;
            if (!results[q.name]) results[q.name] = {};
            results[q.name][stage] = {
                time: exStats.executionTimeMillis,
                docs: exStats.totalDocsExamined,
                stage: exStats.executionStages.stage || exStats.executionStages.shards?.[0].executionStages.stage
            };
        }
    };

    console.log('Measuring BEFORE...');
    await measure('before');

    console.log('Adding indexes...');
    
    // Add logic here to apply indexes temporarily or permanently for testing
    // Connection unique index (need to remove duplicates first? We just seeded so should be fine)
    await Connection.collection.createIndex({ requesterId: 1, recipientId: 1 }, { unique: true });
    await Connection.collection.createIndex({ requesterId: 1, status: 1 });
    await Connection.collection.createIndex({ recipientId: 1, status: 1 });
    await ChatMessage.collection.createIndex({ senderId: 1, receiverId: 1, createdAt: 1 });
    await ChatMessage.collection.createIndex({ receiverId: 1, senderId: 1, createdAt: 1 });
    await GroupMessage.collection.createIndex({ groupId: 1, createdAt: 1 });
    await Achievement.collection.createIndex({ userId: 1, dateOfAchievement: -1 });
    await Achievement.collection.createIndex({ dateOfAchievement: -1 });
    await WorkExperience.collection.createIndex({ userId: 1 });
    await User.collection.createIndex({ role: 1, batch: 1 });
    await User.collection.createIndex({ role: 1, company: 1 });
    await JobOpportunity.collection.createIndex({ createdAt: -1 });
    await ChatGroup.collection.createIndex({ members: 1 });
    await UserPoints.collection.createIndex({ points: -1 });

    console.log('Measuring AFTER...');
    await measure('after');

    console.log('\n--- RESULTS ---');
    console.log('Query | Before (ms/docs) | After (ms/docs) | Index Used');
    for (const q of queries) {
        const b = results[q.name].before;
        const a = results[q.name].after;
        console.log(`${q.name.padEnd(25)} | ${b.time}ms / ${b.docs} docs | ${a.time}ms / ${a.docs} docs | ${a.stage}`);
    }

    process.exit(0);
};

runBenchmark().catch(err => {
    console.error(err);
    process.exit(1);
});
