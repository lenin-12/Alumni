const { Server } = require('socket.io');
const ChatMessage = require('../models/ChatMessage');
const GroupMessage = require('../models/GroupMessage');

const initSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:5173',
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        console.log('Real-time Socket.IO client connected:', socket.id);

        // Join private user room for 1-on-1 direct messages
        socket.on('join_user', (userId) => {
            if (userId) {
                socket.join(userId.toString());
                console.log(`User ${userId} registered socket room.`);
            }
        });

        // Join collaborative group room for multi-member chatrooms
        socket.on('join_group', (groupId) => {
            if (groupId) {
                socket.join(groupId.toString());
                console.log(`Socket joined group chat room: ${groupId}`);
            }
        });

        // Handle private 1-on-1 messages
        socket.on('sendMessage', async (data) => {
            try {
                const { senderId, receiverId, content } = data;
                const message = await ChatMessage.create({
                    senderId,
                    receiverId,
                    content
                });
                
                // Propagate message payload to recipient and sender
                io.to(receiverId.toString()).emit('messageReceived', message);
                io.to(senderId.toString()).emit('messageSent', message);
            } catch (error) {
                console.error("Socket error during private message send:", error);
            }
        });

        // Handle group messages
        socket.on('sendGroupMessage', async (data) => {
            try {
                const { senderId, groupId, content } = data;
                const message = await GroupMessage.create({
                    senderId,
                    groupId,
                    content
                });
                
                // Populate sender details for UI display before broadcasting
                const populatedMessage = await GroupMessage.findById(message._id)
                    .populate('senderId', 'name lastName email');
                
                io.to(groupId.toString()).emit('groupMessageReceived', populatedMessage);
            } catch (error) {
                console.error("Socket error during group message send:", error);
            }
        });

        // Handle direct message edits
        socket.on('messageUpdate', async (data) => {
            try {
                const { id, content } = data;
                const message = await ChatMessage.findByIdAndUpdate(id, { content }, { new: true });
                if (message) {
                    io.to(message.receiverId.toString()).emit('messageUpdated', message);
                    io.to(message.senderId.toString()).emit('messageUpdated', message);
                }
            } catch (error) {
                console.error("Socket message update failed:", error);
            }
        });

        // Handle direct message deletions
        socket.on('messageDelete', async (data) => {
            try {
                const { id } = data;
                const message = await ChatMessage.findByIdAndDelete(id);
                if (message) {
                    io.to(message.receiverId.toString()).emit('messageDeleted', id);
                    io.to(message.senderId.toString()).emit('messageDeleted', id);
                }
            } catch (error) {
                console.error("Socket message delete failed:", error);
            }
        });

        // Handle group message edits
        socket.on('groupMessageUpdate', async (data) => {
            try {
                const { id, content } = data;
                const message = await GroupMessage.findByIdAndUpdate(id, { content }, { new: true })
                    .populate('senderId', 'name lastName email');
                if (message) {
                    io.to(message.groupId.toString()).emit('groupMessageUpdated', message);
                }
            } catch (error) {
                console.error("Socket group message update failed:", error);
            }
        });

        // Handle group message deletions
        socket.on('groupMessageDelete', async (data) => {
            try {
                const { id } = data;
                const message = await GroupMessage.findByIdAndDelete(id);
                if (message) {
                    io.to(message.groupId.toString()).emit('groupMessageDeleted', id);
                }
            } catch (error) {
                console.error("Socket group message delete failed:", error);
            }
        });

        socket.on('disconnect', () => {
            console.log('Real-time Socket.IO client disconnected:', socket.id);
        });
    });

    return io;
};

module.exports = initSocket;
