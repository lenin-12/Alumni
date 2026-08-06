const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    lastName: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Empty for Google OAuth users
    role: { type: String, enum: ['ALUMNI', 'STUDENT', 'ADMIN'], default: 'ALUMNI' },
    batch: { type: Number },
    rollNo: { type: String },
    department: { type: String },
    company: { type: String },
    designation: { type: String },
    location: { type: String },
    bio: { type: String },
    imageUrl: { type: String },
    linkedinProfile: { type: String },
    githubProfile: { type: String },
    profileType: { type: String, enum: ['PUBLIC', 'PRIVATE'], default: 'PUBLIC' },
    authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
    refreshToken: { type: String, default: null, select: false },
}, { timestamps: true });

userSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

userSchema.set('toJSON', {
    virtuals: true,
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.refreshToken;
    }
});

module.exports = mongoose.model('User', userSchema);