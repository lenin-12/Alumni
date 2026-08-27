const JobOpportunity = require('../models/JobOpportunity');

// Get all jobs
const getJobs = async (req, res) => {
    try {
        const jobs = await JobOpportunity.find()
            .populate('postedBy', 'name lastName email imageUrl department')
            .sort({ createdAt: -1 });
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create a new job posting
const createJob = async (req, res) => {
    try {
        const {
            title, company, location, jobType, experienceLevel,
            skills, description, applicationDeadline, applicationLink,
            contactInfo, userId
        } = req.body;

       
        const postedById = req.user ? req.user.id : userId;

        if (!postedById) {
            return res.status(400).json({ success: false, message: 'User ID is required' });
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

        res.status(201).json(job);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete job posting
const deleteJob = async (req, res) => {
    try{
        const job = await JobOpportunity.findById(req.params.id);
        if(!job){
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        // Check whether user has the permission to delete 
        if(req.user && req.user.role !== 'ADMIN' && job.postedBy.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this job' });
        }

        await JobOpportunity.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Job deleted successfully' });
    }catch(error){
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getJobs,
    createJob,
    deleteJob
};
