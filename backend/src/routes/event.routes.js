const express = require('express');
const router = express.Router();
const { getEvents, createEvent, deleteEvent } = require('../controllers/event.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate');
const { eventCreateSchema } = require('../schemas/validation.schemas');

router.get('/', getEvents);

router.post('/', protect, validate(eventCreateSchema), createEvent);
router.delete('/:id', protect, deleteEvent);

module.exports = router;