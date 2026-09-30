const Connection = require('../models/Connection');
const AppError = require('../utils/AppError');

const mapConnectionResponse = (conn) => {
    if (!conn.requesterId || !conn.recipientId) return null;
    return {
        id: conn._id,
        status: conn.status,
        sender: {
            id: conn.requesterId._id,
            name: conn.requesterId.name + (conn.requesterId.lastName ? ' ' + conn.requesterId.lastName : ''),
            email: conn.requesterId.email,
            imageUrl: conn.requesterId.imageUrl
        },
        receiver: {
            id: conn.recipientId._id,
            name: conn.recipientId.name + (conn.recipientId.lastName ? ' ' + conn.recipientId.lastName : ''),
            email: conn.recipientId.email,
            imageUrl: conn.recipientId.imageUrl
        }
    };
};

const getConnectionsByUser = async (req, res) => {
    const { userId } = req.params;

    const connections = await Connection.find({
        $or: [{ requesterId: userId }, { recipientId: userId }]
    })
        .populate('requesterId', 'name lastName email imageUrl')
        .populate('recipientId', 'name lastName email imageUrl');

    const mapped = connections.map(mapConnectionResponse).filter(Boolean);

    const pending = mapped.filter(c => c.status === 'PENDING');
    const accepted = mapped.filter(c => c.status === 'ACCEPTED');

    res.json({ pending, accepted });
};

const getPendingRequests = async (req, res) => {
    const { userId } = req.params;

    const pendingRequests = await Connection.find({
        recipientId: userId,
        status: 'PENDING'
    })
        .populate('requesterId', 'name lastName email imageUrl')
        .populate('recipientId', 'name lastName email imageUrl');

    const mapped = pendingRequests.map(mapConnectionResponse).filter(Boolean);
    res.json(mapped);
};

const getAcceptedConnections = async (req, res) => {
    const { userId } = req.params;

    const acceptedConnections = await Connection.find({
        $or: [{ requesterId: userId }, { recipientId: userId }],
        status: 'ACCEPTED'
    })
        .populate('requesterId', 'name lastName email imageUrl')
        .populate('recipientId', 'name lastName email imageUrl');

    const mapped = acceptedConnections.map(mapConnectionResponse).filter(Boolean);
    res.json(mapped);
};

const sendConnectionRequest = async (req, res) => {
    const { senderId, receiverId } = req.params;

    if (senderId === receiverId) {
        throw new AppError('You cannot connect with yourself', 400);
    }

    const existingConnection = await Connection.findOne({
        $or: [
            { requesterId: senderId, recipientId: receiverId },
            { requesterId: receiverId, recipientId: senderId }
        ]
    });

    if (existingConnection) {
        if (existingConnection.status === 'ACCEPTED') {
            throw new AppError('You are already connected', 400);
        }
        if (existingConnection.status === 'PENDING') {
            throw new AppError('Connection request is already pending', 400);
        }
        existingConnection.status = 'PENDING';
        existingConnection.requesterId = senderId;
        existingConnection.recipientId = receiverId;
        await existingConnection.save();
        return res.json(existingConnection);
    }

    const newConnection = await Connection.create({
        requesterId: senderId,
        recipientId: receiverId,
        status: 'PENDING'
    });

    res.status(201).json(newConnection);
};

const acceptConnectionRequest = async (req, res) => {
    const { requestId } = req.params;

    const connection = await Connection.findById(requestId);
    if (!connection) {
        throw new AppError('Request not found', 404);
    }

    connection.status = 'ACCEPTED';
    await connection.save();

    res.json({ success: true, message: 'Connection accepted successfully' });
};

const rejectConnectionRequest = async (req, res) => {
    const { requestId } = req.params;

    const connection = await Connection.findById(requestId);
    if (!connection) {
        throw new AppError('Request not found', 404);
    }

    connection.status = 'REJECTED';
    await connection.save();

    res.json({ success: true, message: 'Connection request rejected' });
};

module.exports = {
    getConnectionsByUser,
    getPendingRequests,
    getAcceptedConnections,
    sendConnectionRequest,
    acceptConnectionRequest,
    rejectConnectionRequest
};
