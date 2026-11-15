const mongoose = require('mongoose');

const userPointsSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    points: { type: Number, default: 0 },
}, { timestamps: true });

userPointsSchema.index({ points: -1 });

module.exports = mongoose.model('UserPoints', userPointsSchema);
