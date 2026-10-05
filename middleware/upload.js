const multer = require('multer');
const path = require('path');

// Stores the uploaded file in memory (as a Buffer) instead of writing it to disk.
// We convert that buffer to a Base64 string in the controller and save it straight
// into the Return document in MongoDB - this means the photo lives in the database
// itself and survives server restarts/redeploys (unlike local disk storage, which
// free hosting tiers like Render wipe on every redeploy).
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) return cb(null, true);
  cb(new Error('Only JPG, PNG, or WEBP images are allowed'));
};

const uploadReturnPhoto = multer({
  storage,
  fileFilter,
  // Kept small on purpose: the image gets Base64-encoded (~33% larger) and stored
  // directly inside a MongoDB document, so a smaller cap keeps documents light and
  // comfortably under MongoDB's 16MB per-document limit and the Atlas free tier's
  // 512MB total storage limit.
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
});

module.exports = { uploadReturnPhoto };
