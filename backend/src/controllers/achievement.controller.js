const Achievement = require('../models/Achievement');
const { awardPoints, deductPoints } = require('../utils/points');
const cloudinaryUpload = require('../utils/cloudinaryUpload');

// Get all achievements
const getAchievements = async (req, res) => {
    try {
        const achievements = await Achievement.find()
            .populate('userId', 'name lastName email imageUrl department')
            .sort({ dateOfAchievement: -1 });
        
        // Filter out achievements where the populated userId is null/deleted or invalid
        const validAchievements = achievements.filter(ach => ach.userId && typeof ach.userId === 'object' && ach.userId.name);
        
        res.json(validAchievements);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get single achievement by ID
const getAchievementById = async (req, res) => {
    try {
        const achievement = await Achievement.findById(req.params.id);
        if (!achievement) {
            return res.status(404).json({ success: false, message: 'Achievement not found' });
        }
        res.json(achievement);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get achievements of a specific user/alumni
const getAchievementsByAlumni = async (req, res) => {
    try {
        const { alumniId } = req.params;
        const achievements = await Achievement.find({ userId: alumniId }).sort({ dateOfAchievement: -1 });
        res.json(achievements);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create a new achievement entry
const createAchievement = async (req, res) => {
    try {
        const { title, dateOfAchievement, category, description, supportingDocuments, organization, userId } = req.body;
        const finalUserId = req.user ? req.user.id : userId;

        if (!finalUserId) {
            return res.status(400).json({ success: false, message: 'User ID is required' });
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

        // Award 50 points to the user
        await awardPoints(finalUserId, 50);

        res.status(201).json(achievement);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update achievement entry
const updateAchievement = async (req, res) => {
    try {
        const { title, dateOfAchievement, category, description, supportingDocuments, organization } = req.body;
        
        const achievement = await Achievement.findById(req.params.id);
        if (!achievement) {
            return res.status(404).json({ success: false, message: 'Achievement not found' });
        }

        // Check if user is original author or admin
        if (req.user && req.user.role !== 'ADMIN' && achievement.userId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to update this achievement' });
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
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete achievement entry
const deleteAchievement = async (req, res) => {
    try {
        const achievement = await Achievement.findById(req.params.id);
        if (!achievement) {
            return res.status(404).json({ success: false, message: 'Achievement not found' });
        }

        // Check if user is original author or admin
        if (req.user && req.user.role !== 'ADMIN' && achievement.userId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this achievement' });
        }

        await Achievement.findByIdAndDelete(req.params.id);

        // Deduct 50 points from the user
        await deductPoints(achievement.userId, 50);

        res.json({ success: true, message: 'Achievement deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getAchievements,
    getAchievementById,
    getAchievementsByAlumni,
    createAchievement,
    updateAchievement,
    deleteAchievement
};
