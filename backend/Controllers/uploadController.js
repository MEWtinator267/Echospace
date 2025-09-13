// backend/controllers/uploadController.js
import cloudinary from './cloudinary.js';
import streamifier from 'streamifier';
import asyncHandler from 'express-async-handler';

/**
 * @desc    Upload a single file to Cloudinary
 * @route   POST /api/upload/file
 * @access  Private (requires authentication)
 */
const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No file was uploaded.');
  }

  const streamUpload = (fileBuffer) => {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'chat-files', // Optional: saves files in a 'chat-files' folder on Cloudinary
          resource_type: 'auto',
        },
        (error, result) => {
          if (result) {
            resolve(result);
          } else {
            reject(error);
          }
        }
      );
      streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    });
  };

  // Call the upload function with the file's buffer
  try {
    const result = await streamUpload(req.file.buffer);

    // This is the exact JSON response the frontend UI is expecting
    res.status(201).json({
      success: true,
      file: {
        url: result.secure_url,
        name: req.file.originalname,
        mimeType: req.file.mimetype,
      },
    });
  } catch (error) {
    res.status(500);
    throw new Error('File upload failed. Please try again.');
  }
});

export default uploadFile 