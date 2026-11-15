const GalleryItem = require('../models/GalleryItem');
const cloudinaryUpload = require('../utils/cloudinaryUpload');
const AppError = require('../utils/AppError');
const { parsePaginationParams, buildPaginatedResponse } = require('../utils/pagination');
const { getOrSet, getVersion, buildKey } = require('../utils/cache');
const { invalidateGallery } = require('../utils/cacheInvalidation');

const GALLERY_VER_KEY = 'ver:gallery';

const getFolders = async (req, res) => {
    // Note: If distinct('folderName') is also queried often, we could cache this too, but we'll focus on the images list here.
    const folders = await GalleryItem.distinct('folderName');
    const folderObjects = folders.map(folder => ({
        id: folder,
        folderName: folder
    }));
    res.json(folderObjects);
};

const getImagesByFolder = async (req, res) => {
    const { folderName } = req.params;
    const { page, limit, skip } = parsePaginationParams(req);
    const version = await getVersion(GALLERY_VER_KEY);
    const cacheKey = buildKey('gallery', version, `${folderName}:p${page}:l${limit}`);

    const result = await getOrSet(cacheKey, 300, async () => {
        const [images, total] = await Promise.all([
            GalleryItem.find({ folderName })
                .populate('uploadedBy', 'name lastName email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            GalleryItem.countDocuments({ folderName })
        ]);
        return buildPaginatedResponse(images, page, limit, total);
    });

    res.json(result);
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

    await invalidateGallery();
    res.status(201).json(galleryItem);
};

const deleteFolder = async (req, res) => {
    const { folderName } = req.params;

    await GalleryItem.deleteMany({ folderName });
    await invalidateGallery();
    res.json({ success: true, message: `Folder "${folderName}" and all its images deleted successfully` });
};

module.exports = {
    getFolders,
    getImagesByFolder,
    uploadImage,
    deleteFolder
};
