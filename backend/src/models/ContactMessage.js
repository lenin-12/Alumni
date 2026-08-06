const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, default: 'General Inquiry' }, // Default subject
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false }, // Represents whether message is resolved/read
}, { timestamps: true });

contactMessageSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

contactMessageSchema.set('toJSON', {
    virtuals: true,
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});

module.exports = mongoose.model('ContactMessage', contactMessageSchema);
