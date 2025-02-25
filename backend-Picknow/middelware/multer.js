import multer from "multer";
import { v4 as uuid } from "uuid";
import path from "path";
import { fileURLToPath } from 'url';
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const uploadPath = path.join(__dirname, "..", "uploads");
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename(req, file, cb) {
    const id = uuid();
    const extension = file.originalname.split(".").pop();
    const filename = `${id}.${extension}`;

    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(
        new Error("Invalid file type. Only JPEG, PNG, and GIF are allowed.")
      );
    }
    cb(null, filename);
  },
});

// Create multer upload instance
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB file size limit
  },
});

// Middleware for handling file uploads
export const uploadFiles = (req, res, next) => {
  upload.array("pImage", 5)(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    
    // Modify the file paths to be relative
    if (req.files) {
      req.files = req.files.map(file => ({
        ...file,
        path: file.filename // Just store the filename
      }));
    }
    next();
  });
};

// Error handling middleware for multer
export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 5MB' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ message: 'Too many files. Maximum is 5 files' });
    }
    return res.status(400).json({ message: err.message });
  }
  next(err);
};



