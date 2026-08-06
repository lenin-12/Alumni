const UserPoints = require('../models/UserPoints');

// Award points to user for contributions
const awardPoints = async (userId, pointsToAward) => {
    try {
        const up = await UserPoints.findOne({ userId });
        if (up) {
            up.points += pointsToAward;
            await up.save();
        } else {
            await UserPoints.create({ userId, points: pointsToAward });
        }
    } catch (error) {
        console.error("Error awarding points:", error);
    }
};

// Deduct points from user
const deductPoints = async (userId, pointsToDeduct) => {
    try {
        const up = await UserPoints.findOne({ userId });
        if (up) {
            up.points = Math.max(0, up.points - pointsToDeduct);
            await up.save();
        }
    } catch (error) {
        console.error("Error deducting points:", error);
    }
};

module.exports = {
    awardPoints,
    deductPoints
};
