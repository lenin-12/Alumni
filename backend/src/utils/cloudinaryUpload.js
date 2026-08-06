const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

/**
 * Uploads a buffer to Cloudinary and returns the secure URL
 * @param {Buffer} fileBuffer 
 * @returns {Promise<string>}
 */
const cloudinaryUpload = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        if (!fileBuffer) {
            return reject(new Error('No file buffer provided'));
        }
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder: 'alumni_network' },
            (error, result) => {
                if (error) {
                    return reject(error);
                }
                resolve(result.secure_url);
            }
        );
        streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    });
};

module.exports = cloudinaryUpload;
