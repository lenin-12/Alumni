const express = require('express');
const router = express.Router();
const {
    getConnectionsByUser,
    getPendingRequests,
    getAcceptedConnections,
    sendConnectionRequest,
    acceptConnectionRequest,
    rejectConnectionRequest
} = require('../controllers/connection.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/user/:userId', protect, getConnectionsByUser);
router.get('/pending/:userId', protect, getPendingRequests);
router.get('/accepted/:userId', protect, getAcceptedConnections);
router.post('/send/:senderId/:receiverId', protect, sendConnectionRequest);
router.post('/accept/:requestId', protect, acceptConnectionRequest);
router.post('/reject/:requestId', protect, rejectConnectionRequest);

module.exports = router;
