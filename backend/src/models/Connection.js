const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema({
    requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['PENDING', 'ACCEPTED', 'REJECTED'], default: 'PENDING' },
}, { timestamps: true });

connectionSchema.index({ requesterId: 1, recipientId: 1 }, { unique: true });
connectionSchema.index({ requesterId: 1, status: 1 });
connectionSchema.index({ recipientId: 1, status: 1 });

module.exports = mongoose.model('Connection', connectionSchema);
