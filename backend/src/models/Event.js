const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    eventName: { type: String, required: true },
    description: { type: String, required: true },
    eventType: { type: String, required: true },
    organizer: { type: String, required: true },
    date: { type: Date, required: true },
    venue: { type: String, required: true },
    contactPersonEmail: { type: String, required: true },
    sponsorshipDetails: { type: String },
    organizerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    imageUrl: { type: String }
}, { timestamps: true });

eventSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

eventSchema.set('toJSON', {
    virtuals: true,
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});

module.exports = mongoose.model('Event', eventSchema);
