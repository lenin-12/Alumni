const WorkExperience = require('../models/WorkExperience');
const { awardPoints, deductPoints } = require('../utils/points');
const AppError = require('../utils/AppError');
const { parsePaginationParams, buildPaginatedResponse } = require('../utils/pagination');

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

const getWorkExperiences = async (req, res) => {
    const { page, limit, skip } = parsePaginationParams(req);
    const [workExps, total] = await Promise.all([
        WorkExperience.find()
            .populate('userId', 'name lastName email imageUrl')
            .sort({ startDate: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        WorkExperience.countDocuments()
    ]);

    const mapped = workExps.map(mapWorkExperienceResponse).filter(Boolean);
    res.json(buildPaginatedResponse(mapped, page, limit, total));
};

const getWorkExperienceById = async (req, res) => {
    const exp = await WorkExperience.findById(req.params.id);
    if (!exp) {
        throw new AppError('Work experience not found', 404);
    }
    res.json(mapWorkExperienceResponse(exp));
};

const getWorkExperiencesByAlumni = async (req, res) => {
    const { alumniId } = req.params;
    const workExps = await WorkExperience.find({ userId: alumniId }).sort({ startDate: -1 });

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
};

const createWorkExperience = async (req, res) => {
    const { company, role, startDate, endDate, isPresent, isCurrent, description, user } = req.body;

    const finalUserId = req.user ? req.user.id : (user ? user.id : undefined);

    if (!finalUserId) {
        throw new AppError('User ID is required', 400);
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

    try {
        await awardPoints(finalUserId, 30);
    } catch (pointsError) {
        console.error('Failed to award points after work experience create:', pointsError);
    }

    res.status(201).json(mapWorkExperienceResponse(exp));
};

const updateWorkExperience = async (req, res) => {
    const { company, role, startDate, endDate, isPresent, isCurrent, description } = req.body;

    const exp = await WorkExperience.findById(req.params.id);
    if (!exp) {
        throw new AppError('Work experience not found', 404);
    }

    if (req.user && req.user.role !== 'ADMIN' && exp.userId.toString() !== req.user.id) {
        throw new AppError('Not authorized', 403);
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
};

const deleteWorkExperience = async (req, res) => {
    const exp = await WorkExperience.findById(req.params.id);
    if (!exp) {
        throw new AppError('Work experience not found', 404);
    }

    if (req.user && req.user.role !== 'ADMIN' && exp.userId.toString() !== req.user.id) {
        throw new AppError('Not authorized', 403);
    }

    await WorkExperience.findByIdAndDelete(req.params.id);

    try {
        await deductPoints(exp.userId, 30);
    } catch (pointsError) {
        console.error('Failed to deduct points after work experience delete:', pointsError);
    }

    res.json({ success: true, message: 'Work experience deleted successfully' });
};

module.exports = {
    getWorkExperiences,
    getWorkExperienceById,
    getWorkExperiencesByAlumni,
    createWorkExperience,
    updateWorkExperience,
    deleteWorkExperience
};
