const { incrVersion, del, entityKey } = require('./cache');

// Version key names matching those used in controllers
const JOBS_VER_KEY = 'ver:jobs';
const EVENTS_VER_KEY = 'ver:events';
const ACHIEVEMENTS_VER_KEY = 'ver:achievements';
const GALLERY_VER_KEY = 'ver:gallery';
const LEADERBOARD_VER_KEY = 'ver:leaderboard';
const ALUMNI_LIST_VER_KEY = 'ver:alumni_list';

const invalidateJobs = async () => incrVersion(JOBS_VER_KEY);
const invalidateEvents = async () => incrVersion(EVENTS_VER_KEY);
const invalidateAchievements = async () => incrVersion(ACHIEVEMENTS_VER_KEY);
const invalidateGallery = async () => incrVersion(GALLERY_VER_KEY);
const invalidateLeaderboard = async () => incrVersion(LEADERBOARD_VER_KEY);
const invalidateAlumniList = async () => incrVersion(ALUMNI_LIST_VER_KEY);

const invalidateUser = async (userId) => {
    if (userId) {
        await del(entityKey('user', userId.toString()));
    }
};

const invalidateUserPoints = async (userId) => {
    if (userId) {
        await del(entityKey('points', userId.toString()));
    }
};

module.exports = {
    invalidateJobs,
    invalidateEvents,
    invalidateAchievements,
    invalidateGallery,
    invalidateLeaderboard,
    invalidateAlumniList,
    invalidateUser,
    invalidateUserPoints,
};
