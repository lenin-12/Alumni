const GalleryItem = require('../models/GalleryItem');
const cloudinaryUpload = require('../utils/cloudinaryUpload');
const AppError = require('../utils/AppError');

const getFolders = async (req, res) => {
    const folders = await GalleryItem.distinct('folderName');
    const folderObjects = folders.map(folder => ({
        id: folder,
        folderName: folder
    }));
    res.json(folderObjects);
};

const getImagesByFolder = async (req, res) => {
    const { folderName } = req.params;
    const images = await GalleryItem.find({ folderName })
        .populate('uploadedBy', 'name lastName email')
        .sort({ createdAt: -1 });
    res.json(images);
};

const uploadImage = async (req, res) => {
    const { folderName, userId, title, description } = req.body;
    const finalUserId = req.user ? req.user.id : userId;

    if (!req.file) {
        throw new AppError('Image file is required', 400);
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
};

const deleteFolder = async (req, res) => {
    const { folderName } = req.params;

    await GalleryItem.deleteMany({ folderName });
    res.json({ success: true, message: `Folder "${folderName}" and all its images deleted successfully` });
};

module.exports = {
    getFolders,
    getImagesByFolder,
    uploadImage,
    deleteFolder
};
