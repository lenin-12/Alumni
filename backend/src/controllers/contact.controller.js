const ContactMessage = require('../models/ContactMessage');
const AppError = require('../utils/AppError');
const { parsePaginationParams, buildPaginatedResponse } = require('../utils/pagination');

const submitMessage = async (req, res) => {
    const { name, email, subject, message } = req.body;

    const contactMsg = await ContactMessage.create({
        name,
        email,
        subject: subject || 'General Inquiry',
        message
    });

    res.status(201).json(contactMsg);
};

const getMessages = async (req, res) => {
    const { page, limit, skip } = parsePaginationParams(req);
    const [messages, total] = await Promise.all([
        ContactMessage.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        ContactMessage.countDocuments()
    ]);
    res.json(buildPaginatedResponse(messages, page, limit, total));
};

const resolveMessage = async (req, res) => {
    const contactMsg = await ContactMessage.findById(req.params.id);
    if (!contactMsg) {
        throw new AppError('Message not found', 404);
    }

    contactMsg.isRead = true;
    await contactMsg.save();

    res.json(contactMsg);
};

const deleteMessage = async (req, res) => {
    const contactMsg = await ContactMessage.findById(req.params.id);
    if (!contactMsg) {
        throw new AppError('Message not found', 404);
    }

    await ContactMessage.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Message deleted successfully' });
};

module.exports = {
    submitMessage,
    getMessages,
    resolveMessage,
    deleteMessage
};
