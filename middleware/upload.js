const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Returned-item photos are stored on disk under public/uploads/returns and served
// as normal static files (the folder already sits inside the public/ root that
// server.js serves with express.static).
const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'returns');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `return-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) return cb(null, true);
  cb(new Error('Only JPG, PNG, or WEBP images are allowed'));
};

const uploadReturnPhoto = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max - plenty for a phone photo
});

module.exports = { uploadReturnPhoto };
