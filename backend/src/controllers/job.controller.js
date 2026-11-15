const JobOpportunity = require('../models/JobOpportunity');
const AppError = require('../utils/AppError');
const { parsePaginationParams, buildPaginatedResponse } = require('../utils/pagination');
const { getOrSet, getVersion, buildKey } = require('../utils/cache');
const { invalidateJobs } = require('../utils/cacheInvalidation');

const JOBS_VER_KEY = 'ver:jobs';

const getJobs = async (req, res) => {
    const { page, limit, skip } = parsePaginationParams(req);
    const version = await getVersion(JOBS_VER_KEY);
    const cacheKey = buildKey('jobs', version, `p${page}:l${limit}`);

    const result = await getOrSet(cacheKey, 120, async () => {
        const [jobs, total] = await Promise.all([
            JobOpportunity.find()
                .populate('postedBy', 'name lastName email imageUrl department')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            JobOpportunity.countDocuments()
        ]);
        return buildPaginatedResponse(jobs, page, limit, total);
    });

    res.json(result);
};

const createJob = async (req, res) => {
    const {
        title, company, location, jobType, experienceLevel,
        skills, description, applicationDeadline, applicationLink,
        contactInfo, userId
    } = req.body;

    const postedById = req.user ? req.user.id : userId;

    if (!postedById) {
        throw new AppError('User ID is required', 400);
    }

    const job = await JobOpportunity.create({
        title,
        company,
        location,
        jobType,
        experienceLevel,
        skills,
        description,
        applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : undefined,
        applicationLink,
        contactInfo,
        postedBy: postedById
    });

    await invalidateJobs();
    res.status(201).json(job);
};

const deleteJob = async (req, res) => {
    const job = await JobOpportunity.findById(req.params.id);
    if (!job) {
        throw new AppError('Job not found', 404);
    }

    if (req.user && req.user.role !== 'ADMIN' && job.postedBy.toString() !== req.user.id) {
        throw new AppError('Not authorized to delete this job', 403);
    }

    await JobOpportunity.findByIdAndDelete(req.params.id);
    await invalidateJobs();
    res.json({ success: true, message: 'Job deleted successfully' });
};

module.exports = {
    getJobs,
    createJob,
    deleteJob
};
