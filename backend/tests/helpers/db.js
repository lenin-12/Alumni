require('./env');
const mongoose = require('mongoose');


const BASE_URI = process.env.MONGO_URI_TEST || 'mongodb://127.0.0.1:27017';


const connectTestDb = async (name) => {
    const dbName = `alumni_test_${name}`;
    if (!dbName.includes('test')) throw new Error('Refusing to run tests on a non-test database');

    try {
        await mongoose.connect(BASE_URI, { dbName, serverSelectionTimeoutMS: 4000 });
    } catch (err) {
        if (process.env.CI) throw err;
        return { skipReason: `MongoDB not reachable at ${BASE_URI} (set MONGO_URI_TEST). ${err.message}` };
    }

    await mongoose.connection.dropDatabase(); // safe: name is guarded above
    return { dbName };
};

const disconnectTestDb = async () => {
    if (mongoose.connection.readyState === 1) {
        await mongoose.connection.dropDatabase();
    }
    await mongoose.disconnect();
};

module.exports = { connectTestDb, disconnectTestDb };