const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const dotenv = require('dotenv');

dotenv.config();

// Configure Cloudinary with your keys
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Storage Engine
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'waste_reports',
    // --- UPDATED FORMATS ---
    // We now support PNG, JPG, JPEG, and WEBP
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'], 
    // -----------------------
  },
});

const upload = multer({ storage: storage });

module.exports = { upload };