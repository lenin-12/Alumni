require('dotenv').config();
const mongoose = require('mongoose');

const models = [
    require('../src/models/User'),
    require('../src/models/ChatMessage'),
    require('../src/models/GroupMessage'),
    require('../src/models/Connection'),
    require('../src/models/Achievement'),
    require('../src/models/JobOpportunity'),
    require('../src/models/ChatGroup'),
    require('../src/models/UserPoints'),
    require('../src/models/WorkExperience'),
    require('../src/models/ContactMessage'),
    require('../src/models/Event'),
    require('../src/models/GalleryItem')
];

const run = async () => {
    const uri = process.env.MONGO_URI;
    if (!uri) {
        console.error("MONGO_URI not set");
        process.exit(1);
    }
    
    await mongoose.connect(uri);
    console.log(`Connected to DB: ${uri}`);
    
    console.log("Checking for Connection duplicates before building indexes...");
    const duplicates = await mongoose.model('Connection').aggregate([
        { $group: { _id: { requesterId: "$requesterId", recipientId: "$recipientId" }, count: { $sum: 1 }, docs: { $push: "$_id" } } },
        { $match: { count: { $gt: 1 } } }
    ]);
    
    if (duplicates.length > 0) {
        console.log(`Found ${duplicates.length} duplicate connection pairs. Removing duplicates...`);
        for (const dup of duplicates) {
            // Keep the first one, delete the rest
            const toDelete = dup.docs.slice(1);
            await mongoose.model('Connection').deleteMany({ _id: { $in: toDelete } });
        }
        console.log("Duplicates removed.");
    }
    
    console.log("Syncing indexes for all models...");
    for (const model of models) {
        await model.syncIndexes();
        console.log(`Synced indexes for ${model.modelName}`);
    }
    
    console.log("All indexes synced successfully.");
    process.exit(0);
};

run().catch(err => {
    console.error(err);
    process.exit(1);
});
