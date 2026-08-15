// src/utils/cloudinary.js — Configuración y helpers de Cloudinary
const cloudinary = require('cloudinary').v2;
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer en memoria (no guarda en disco)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB máx
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido. Usa JPG, PNG, WEBP, MP4 o WEBM.'));
    }
  },
});

/**
 * Sube un buffer a Cloudinary
 * @param {Buffer} buffer
 * @param {object} options
 * @returns {Promise<{url: string, publicId: string, type: 'IMAGE'|'VIDEO'}>}
 */
function uploadToCloudinary(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const isVideo = options.resourceType === 'video';
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'movilcenter',
        resource_type: isVideo ? 'video' : 'image',
        transformation: isVideo
          ? []
          : [{ quality: 'auto:good', fetch_format: 'auto', width: 1200, crop: 'limit' }],
        ...options,
      },
      (err, result) => {
        if (err) return reject(err);
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          type: isVideo ? 'VIDEO' : 'IMAGE',
        });
      }
    );
    stream.end(buffer);
  });
}

/**
 * Elimina un archivo de Cloudinary por su public_id
 */
async function deleteFromCloudinary(publicId, resourceType = 'image') {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (err) {
    console.error('Error eliminando de Cloudinary:', err.message);
  }
}

module.exports = { upload, uploadToCloudinary, deleteFromCloudinary };
