const mongoose = require('mongoose');
const { getClient, getIsReady } = require('../config/redis');
const { getMetrics } = require('../utils/cache');


const getLiveness = (req, res) => {
    res.status(200).json({
        success: true,
        status: 'ok',
        uptime: Math.round(process.uptime()),
        timestamp: new Date().toISOString(),
    });
};


const getReadiness = (req, res) => {
    const mongoUp = mongoose.connection.readyState === 1;
    const redisClient = getClient();

    let redis = 'disabled';
    if (redisClient) {
        redis = getIsReady() ? 'up' : 'down';
    }

    res.status(mongoUp ? 200 : 503).json({
        success: mongoUp,
        status: mongoUp ? 'ready' : 'not_ready',
        checks: {
            mongo: mongoUp ? 'up' : 'down',
            redis,
        },
    });
};


const getCacheHealth = (req, res) => {
    const client = getClient();
    const ready = getIsReady();
    const metrics = getMetrics();

    res.json({
        success: true,
        redis: {
            enabled: !!client,
            connected: ready,
        },
        metrics,
    });
};

module.exports = { getLiveness, getReadiness, getCacheHealth };