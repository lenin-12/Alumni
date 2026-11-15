const Event = require('../models/Event');
const AppError = require('../utils/AppError');
const { parsePaginationParams, buildPaginatedResponse } = require('../utils/pagination');
const { getOrSet, getVersion, buildKey } = require('../utils/cache');
const { invalidateEvents } = require('../utils/cacheInvalidation');

const EVENTS_VER_KEY = 'ver:events';

const getEvents = async (req, res) => {
    const { page, limit, skip } = parsePaginationParams(req);
    const version = await getVersion(EVENTS_VER_KEY);
    const cacheKey = buildKey('events', version, `p${page}:l${limit}`);

    const result = await getOrSet(cacheKey, 300, async () => {
        const [events, total] = await Promise.all([
            Event.find()
                .populate('organizerId', 'name lastName email imageUrl')
                .sort({ date: 1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Event.countDocuments()
        ]);
        return buildPaginatedResponse(events, page, limit, total);
    });

    res.json(result);
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

    await invalidateEvents();
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
    await invalidateEvents();
    res.json({ success: true, message: 'Event deleted successfully' });
};

module.exports = {
    getEvents,
    createEvent,
    deleteEvent
};
