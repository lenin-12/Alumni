const express = require('express');
const router = express.Router();
const { getEvents, createEvent, deleteEvent } = require('../controllers/event.controller');
const { protect } = require('../middleware/auth.middleware');


router.get('/', getEvents);

router.post('/', protect, createEvent);
router.delete('/:id', protect, deleteEvent);

module.exports = router;