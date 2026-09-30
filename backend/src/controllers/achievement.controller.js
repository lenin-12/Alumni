const Achievement = require('../models/Achievement');
const { awardPoints, deductPoints } = require('../utils/points');
const cloudinaryUpload = require('../utils/cloudinaryUpload');
const AppError = require('../utils/AppError');

const getAchievements = async (req, res) => {
    const achievements = await Achievement.find()
        .populate('userId', 'name lastName email imageUrl department')
        .sort({ dateOfAchievement: -1 });

    const validAchievements = achievements.filter(ach => ach.userId && typeof ach.userId === 'object' && ach.userId.name);

    res.json(validAchievements);
};

const getAchievementById = async (req, res) => {
    const achievement = await Achievement.findById(req.params.id);
    if (!achievement) {
        throw new AppError('Achievement not found', 404);
    }
    res.json(achievement);
};

const getAchievementsByAlumni = async (req, res) => {
    const { alumniId } = req.params;
    const achievements = await Achievement.find({ userId: alumniId }).sort({ dateOfAchievement: -1 });
    res.json(achievements);
};

const createAchievement = async (req, res) => {
    const { title, dateOfAchievement, category, description, supportingDocuments, organization, userId } = req.body;
    const finalUserId = req.user ? req.user.id : userId;

    if (!finalUserId) {
        throw new AppError('User ID is required', 400);
    }

    let finalSupportingDocs = supportingDocuments;
    if (req.file) {
        finalSupportingDocs = await cloudinaryUpload(req.file.buffer);
    }

    const achievement = await Achievement.create({
        title,
        dateOfAchievement: new Date(dateOfAchievement),
        category,
        description,
        supportingDocuments: finalSupportingDocs,
        organization,
        userId: finalUserId
    });

    try {
        await awardPoints(finalUserId, 50);
    } catch (pointsError) {
        console.error('Failed to award points after achievement create:', pointsError);
    }

    res.status(201).json(achievement);
};

const updateAchievement = async (req, res) => {
    const { title, dateOfAchievement, category, description, supportingDocuments, organization } = req.body;

    const achievement = await Achievement.findById(req.params.id);
    if (!achievement) {
        throw new AppError('Achievement not found', 404);
    }

    if (req.user && req.user.role !== 'ADMIN' && achievement.userId.toString() !== req.user.id) {
        throw new AppError('Not authorized to update this achievement', 403);
    }

    achievement.title = title || achievement.title;
    achievement.dateOfAchievement = dateOfAchievement ? new Date(dateOfAchievement) : achievement.dateOfAchievement;
    achievement.category = category || achievement.category;
    achievement.description = description || achievement.description;
    achievement.organization = organization || achievement.organization;

    if (req.file) {
        achievement.supportingDocuments = await cloudinaryUpload(req.file.buffer);
    } else if (supportingDocuments !== undefined) {
        achievement.supportingDocuments = supportingDocuments;
    }

    await achievement.save();
    res.json(achievement);
};

const deleteAchievement = async (req, res) => {
    const achievement = await Achievement.findById(req.params.id);
    if (!achievement) {
        throw new AppError('Achievement not found', 404);
    }

    if (req.user && req.user.role !== 'ADMIN' && achievement.userId.toString() !== req.user.id) {
        throw new AppError('Not authorized to delete this achievement', 403);
    }

    await Achievement.findByIdAndDelete(req.params.id);

    try {
        await deductPoints(achievement.userId, 50);
    } catch (pointsError) {
        console.error('Failed to deduct points after achievement delete:', pointsError);
    }

    res.json({ success: true, message: 'Achievement deleted successfully' });
};

module.exports = {
    getAchievements,
    getAchievementById,
    getAchievementsByAlumni,
    createAchievement,
    updateAchievement,
    deleteAchievement
};
