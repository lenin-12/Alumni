const mongoose = require('mongoose');

const galleryItemSchema = new mongoose.Schema({
    title: { type: String },
    description: { type: String },
    imageUrl: { type: String, required: true },
    folderName: { type: String, required: true, default: 'General' },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

galleryItemSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

galleryItemSchema.set('toJSON', {
    virtuals: true,
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});

module.exports = mongoose.model('GalleryItem', galleryItemSchema);
