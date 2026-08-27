const mongoose = require('mongoose');

const jobOpportunitySchema = new mongoose.Schema({
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, required: true },
    jobType: { type: String }, //example: Full-time, Part-time, Internship
    experienceLevel: { type: String }, //example: Entry, Mid, Senior
    skills: { type: String },
    description: { type: String, required: true },
    applicationDeadline: { type: Date },
    applicationLink: { type: String },
    contactInfo: { type: String },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

jobOpportunitySchema.virtual('id').get(function() {
    return this._id.toHexString();
});

jobOpportunitySchema.set('toJSON', {
    virtuals: true,
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});

module.exports = mongoose.model('JobOpportunity', jobOpportunitySchema);
