const GalleryItem = require('../models/GalleryItem');
const cloudinaryUpload = require('../utils/cloudinaryUpload');

// GET /api/gallery/folders
// Returns list of unique folder names
const getFolders = async (req, res) => {
    try {
        const folders = await GalleryItem.distinct('folderName');
        // Map folder names to objects containing id and folderName
        const folderObjects = folders.map(folder => ({
            id: folder, // Use folder name as ID to keep it simple and unique
            folderName: folder
        }));
        res.json(folderObjects);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/gallery/folder/:folderName
// Returns all gallery images inside a specific folder
const getImagesByFolder = async (req, res) => {
    try {
        const { folderName } = req.params;
        const images = await GalleryItem.find({ folderName })
            .populate('uploadedBy', 'name lastName email')
            .sort({ createdAt: -1 });
        res.json(images);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /api/gallery/upload
// Adds a new image metadata entry to the database
const uploadImage = async (req, res) => {
    try {
        const { folderName, userId, title, description } = req.body;
        const finalUserId = req.user ? req.user.id : userId;

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Image file is required' });
        }

        const imageUrl = await cloudinaryUpload(req.file.buffer);

        const galleryItem = await GalleryItem.create({
            title,
            description,
            imageUrl,
            folderName: folderName || 'General',
            uploadedBy: finalUserId
        });

        res.status(201).json(galleryItem);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// DELETE /api/gallery/folder/:folderName
// Deletes a folder and all its images
const deleteFolder = async (req, res) => {
    try {
        const { folderName } = req.params;

        await GalleryItem.deleteMany({ folderName });
        res.json({ success: true, message: `Folder "${folderName}" and all its images deleted successfully` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getFolders,
    getImagesByFolder,
    uploadImage,
    deleteFolder
};
