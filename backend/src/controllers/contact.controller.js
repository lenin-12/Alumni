const ContactMessage = require('../models/ContactMessage');

// POST /api/contact/submit
// Submits a new contact/inquiry message from the contact form
const submitMessage = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ success: false, message: 'Name, email, and message are required' });
        }

        const contactMsg = await ContactMessage.create({
            name,
            email,
            subject: subject || 'General Inquiry',
            message
        });

        res.status(201).json(contactMsg);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/contact/all
// Returns all contact messages received (guarded for Admin only)
const getMessages = async (req, res) => {
    try {
        const messages = await ContactMessage.find().sort({ createdAt: -1 });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// PUT /api/contact/:id/resolve
// Marks a contact message as read/resolved
const resolveMessage = async (req, res) => {
    try {
        const contactMsg = await ContactMessage.findById(req.params.id);
        if (!contactMsg) {
            return res.status(404).json({ success: false, message: 'Message not found' });
        }

        contactMsg.isRead = true;
        await contactMsg.save();

        res.json(contactMsg);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// DELETE /api/contact/:id
// Deletes a contact message
const deleteMessage = async (req, res) => {
    try {
        const contactMsg = await ContactMessage.findById(req.params.id);
        if (!contactMsg) {
            return res.status(404).json({ success: false, message: 'Message not found' });
        }

        await ContactMessage.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Message deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    submitMessage,
    getMessages,
    resolveMessage,
    deleteMessage
};
