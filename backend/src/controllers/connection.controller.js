const Connection = require('../models/Connection');
const User = require('../models/User');

// Map database Connection object to structure expected by frontend
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

// GET /api/connections/user/:userId
// Returns all pending and accepted connections for a specific user
const getConnectionsByUser = async (req, res) => {
    try {
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
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/connections/pending/:userId
// Returns pending connection requests received by the user
const getPendingRequests = async (req, res) => {
    try {
        const { userId } = req.params;

        const pendingRequests = await Connection.find({
            recipientId: userId,
            status: 'PENDING'
        })
        .populate('requesterId', 'name lastName email imageUrl')
        .populate('recipientId', 'name lastName email imageUrl');

        const mapped = pendingRequests.map(mapConnectionResponse).filter(Boolean);
        res.json(mapped);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/connections/accepted/:userId
// Returns accepted connections for the user
const getAcceptedConnections = async (req, res) => {
    try {
        const { userId } = req.params;

        const acceptedConnections = await Connection.find({
            $or: [{ requesterId: userId }, { recipientId: userId }],
            status: 'ACCEPTED'
        })
        .populate('requesterId', 'name lastName email imageUrl')
        .populate('recipientId', 'name lastName email imageUrl');

        const mapped = acceptedConnections.map(mapConnectionResponse).filter(Boolean);
        res.json(mapped);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /api/connections/send/:senderId/:receiverId
// Sends a new connection request
const sendConnectionRequest = async (req, res) => {
    try {
        const { senderId, receiverId } = req.params;

        if (senderId === receiverId) {
            return res.status(400).json({ success: false, message: 'You cannot connect with yourself' });
        }

        // Check if connection already exists
        const existingConnection = await Connection.findOne({
            $or: [
                { requesterId: senderId, recipientId: receiverId },
                { requesterId: receiverId, recipientId: senderId }
            ]
        });

        if (existingConnection) {
            if (existingConnection.status === 'ACCEPTED') {
                return res.status(400).json({ success: false, message: 'You are already connected' });
            } else if (existingConnection.status === 'PENDING') {
                return res.status(400).json({ success: false, message: 'Connection request is already pending' });
            } else {
                // If rejected, allow re-requesting by resetting status to pending
                existingConnection.status = 'PENDING';
                existingConnection.requesterId = senderId;
                existingConnection.recipientId = receiverId;
                await existingConnection.save();
                return res.json(existingConnection);
            }
        }

        const newConnection = await Connection.create({
            requesterId: senderId,
            recipientId: receiverId,
            status: 'PENDING'
        });

        res.status(201).json(newConnection);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /api/connections/accept/:requestId
// Accepts a connection request
const acceptConnectionRequest = async (req, res) => {
    try {
        const { requestId } = req.params;

        const connection = await Connection.findById(requestId);
        if (!connection) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }

        connection.status = 'ACCEPTED';
        await connection.save();

        res.json({ success: true, message: 'Connection accepted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /api/connections/reject/:requestId
// Rejects a connection request
const rejectConnectionRequest = async (req, res) => {
    try {
        const { requestId } = req.params;

        const connection = await Connection.findById(requestId);
        if (!connection) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }

        connection.status = 'REJECTED';
        await connection.save();

        res.json({ success: true, message: 'Connection request rejected' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getConnectionsByUser,
    getPendingRequests,
    getAcceptedConnections,
    sendConnectionRequest,
    acceptConnectionRequest,
    rejectConnectionRequest
};
