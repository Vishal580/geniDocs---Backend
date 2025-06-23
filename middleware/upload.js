const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'podcast-app',
    resource_type: 'auto',
    format: async (req, file) => 'mp3',
    public_id: (req, file) => 
      `podcast-${Date.now()}-${Math.round(Math.random() * 1E9)}`
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB
});

module.exports = upload;