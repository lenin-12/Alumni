const Event = require('../models/Event');

// Get all events
const getEvents = async (req, res) => {
    try {
        const events = await Event.find()
            .populate('organizerId', 'name lastName email imageUrl')
            .sort({ date: 1 }); // Sort by date ascending
        res.json(events);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create a new event
const createEvent = async (req, res) => {
    try {
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
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete event
const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        // Check if user is authorized to delete (is admin or the original organizer)
        if (req.user && req.user.role !== 'ADMIN' && event.organizerId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this event' });
        }

        await Event.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getEvents,
    createEvent,
    deleteEvent
};
