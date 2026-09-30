const Event = require('../models/Event');
const AppError = require('../utils/AppError');

const getEvents = async (req, res) => {
    const events = await Event.find()
        .populate('organizerId', 'name lastName email imageUrl')
        .sort({ date: 1 });
    res.json(events);
};

const createEvent = async (req, res) => {
    const {
        eventName, description, eventType, organizer,
        date, venue, contactPersonEmail, sponsorshipDetails,
        imageUrl
    } = req.body;

    const organizerId = req.user ? req.user.id : undefined;

    const event = await Event.create({
        eventName,
        description,
        eventType,
        organizer,
        date: new Date(date),
        venue,
        contactPersonEmail,
        sponsorshipDetails,
        organizerId,
        imageUrl
    });

    res.status(201).json(event);
};

const deleteEvent = async (req, res) => {
    const event = await Event.findById(req.params.id);
    if (!event) {
        throw new AppError('Event not found', 404);
    }

    if (req.user && req.user.role !== 'ADMIN' && event.organizerId.toString() !== req.user.id) {
        throw new AppError('Not authorized to delete this event', 403);
    }

    await Event.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Event deleted successfully' });
};

module.exports = {
    getEvents,
    createEvent,
    deleteEvent
};
