const express = require('express');
const router = express.Router();
const { getFolders, getImagesByFolder, uploadImage, deleteFolder } = require('../controllers/gallery.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload');

router.get('/folders', protect, getFolders);
router.get('/folder/:folderName', protect, getImagesByFolder);
router.post('/upload', protect, upload.single('image'), uploadImage);
router.delete('/folder/:folderName', protect, authorize('ADMIN'), deleteFolder);

module.exports = router;
