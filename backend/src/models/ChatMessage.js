const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
}, { timestamps: true });

chatMessageSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

chatMessageSchema.set('toJSON', {
    virtuals: true,
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});

chatMessageSchema.index({ senderId: 1, receiverId: 1, createdAt: 1 });
chatMessageSchema.index({ receiverId: 1, senderId: 1, createdAt: 1 });
chatMessageSchema.index({senderId: 1,receiverId: 1,_id: -1});
chatMessageSchema.index({receiverId: 1,senderId: 1,_id: -1});

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
