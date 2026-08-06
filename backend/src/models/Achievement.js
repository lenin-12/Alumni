const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
    title: { type: String, required: true },
    dateOfAchievement: { type: Date, required: true },
    category: { type: String }, // e.g. Award, Certification, Recognition, Publication, Other
    description: { type: String, required: true },
    supportingDocuments: { type: String }, // Stores image/doc URL
    organization: { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

achievementSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

achievementSchema.set('toJSON', {
    virtuals: true,
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});

module.exports = mongoose.model('Achievement', achievementSchema);
