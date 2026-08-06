const mongoose = require('mongoose');

const workExperienceSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    company: { type: String, required: true },
    role: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    isCurrent: { type: Boolean, default: false },
    description: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('WorkExperience', workExperienceSchema);
