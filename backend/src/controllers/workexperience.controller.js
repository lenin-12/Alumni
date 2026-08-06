const WorkExperience = require('../models/WorkExperience');
const { awardPoints, deductPoints } = require('../utils/points');

// Map WorkExperience model to frontend expected output structure
const mapWorkExperienceResponse = (exp) => {
    if (!exp) return null;
    return {
        id: exp._id,
        company: exp.company,
        role: exp.role,
        startDate: exp.startDate,
        endDate: exp.endDate,
        isCurrent: exp.isCurrent,
        description: exp.description,
        user: exp.userId ? {
            id: exp.userId._id,
            name: exp.userId.name + (exp.userId.lastName ? ' ' + exp.userId.lastName : ''),
            email: exp.userId.email,
            imageUrl: exp.userId.imageUrl
        } : null
    };
};

// Get all work experience listings
const getWorkExperiences = async (req, res) => {
    try {
        const workExps = await WorkExperience.find()
            .populate('userId', 'name lastName email imageUrl')
            .sort({ startDate: -1 });
        
        const mapped = workExps.map(mapWorkExperienceResponse).filter(Boolean);
        res.json(mapped);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get single work experience by ID
const getWorkExperienceById = async (req, res) => {
    try {
        const exp = await WorkExperience.findById(req.params.id);
        if (!exp) {
            return res.status(404).json({ success: false, message: 'Work experience not found' });
        }
        res.json(mapWorkExperienceResponse(exp));
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get work experiences for a specific alumnus
const getWorkExperiencesByAlumni = async (req, res) => {
    try {
        const { alumniId } = req.params;
        const workExps = await WorkExperience.find({ userId: alumniId }).sort({ startDate: -1 });
        
        // Map elements, populate user is not needed if the page already knows the user,
        // but we add a stub for safety
        const mapped = workExps.map(exp => ({
            id: exp._id,
            company: exp.company,
            role: exp.role,
            startDate: exp.startDate,
            endDate: exp.endDate,
            isCurrent: exp.isCurrent,
            description: exp.description
        }));
        
        res.json(mapped);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create new work experience entry
const createWorkExperience = async (req, res) => {
    try {
        const { company, role, startDate, endDate, isPresent, isCurrent, description, user } = req.body;
        
        // Handle nested user ID payload from frontend
        const finalUserId = req.user ? req.user.id : (user ? user.id : undefined);

        if (!finalUserId) {
            return res.status(400).json({ success: false, message: 'User ID is required' });
        }

        const isCurrentJob = isPresent || isCurrent || (endDate == null);

        const exp = await WorkExperience.create({
            company,
            role,
            startDate: new Date(startDate),
            endDate: isCurrentJob ? null : new Date(endDate),
            isCurrent: isCurrentJob,
            description,
            userId: finalUserId
        });

        // Award 30 points to the user for contributing their work history
        await awardPoints(finalUserId, 30);

        res.status(201).json(mapWorkExperienceResponse(exp));
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update work experience entry
const updateWorkExperience = async (req, res) => {
    try {
        const { company, role, startDate, endDate, isPresent, isCurrent, description } = req.body;

        const exp = await WorkExperience.findById(req.params.id);
        if (!exp) {
            return res.status(404).json({ success: false, message: 'Work experience not found' });
        }

        // Access check
        if (req.user && req.user.role !== 'ADMIN' && exp.userId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const isCurrentJob = isPresent || isCurrent || (endDate == null);

        exp.company = company || exp.company;
        exp.role = role || exp.role;
        exp.startDate = startDate ? new Date(startDate) : exp.startDate;
        exp.endDate = isCurrentJob ? null : (endDate ? new Date(endDate) : exp.endDate);
        exp.isCurrent = isCurrentJob;
        exp.description = description || exp.description;

        await exp.save();
        res.json(mapWorkExperienceResponse(exp));
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete work experience entry
const deleteWorkExperience = async (req, res) => {
    try {
        const exp = await WorkExperience.findById(req.params.id);
        if (!exp) {
            return res.status(404).json({ success: false, message: 'Work experience not found' });
        }

        // Access check
        if (req.user && req.user.role !== 'ADMIN' && exp.userId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        await WorkExperience.findByIdAndDelete(req.params.id);

        // Deduct 30 points on removal
        await deductPoints(exp.userId, 30);

        res.json({ success: true, message: 'Work experience deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getWorkExperiences,
    getWorkExperienceById,
    getWorkExperiencesByAlumni,
    createWorkExperience,
    updateWorkExperience,
    deleteWorkExperience
};
