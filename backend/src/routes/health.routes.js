const express = require('express');
const router = express.Router();
const { getLiveness, getReadiness, getCacheHealth } = require('../controllers/health.controller');

router.get('/', getLiveness);
router.get('/ready', getReadiness);
router.get('/cache', getCacheHealth);

module.exports = router;