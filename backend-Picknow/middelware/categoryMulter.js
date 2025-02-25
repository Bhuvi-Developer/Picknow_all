import multer from "multer";
import { v4 as uuid } from "uuid";
import path from "path";
import { fileURLToPath } from 'url';
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination(req, file, cb) {
    // Use absolute path to ensure correct directory
    const uploadPath = path.join(process.cwd(), "uploads", "category");
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

// Middleware for handling single file upload
export const uploadFiles2 = (req, res, next) => {
  upload.single("cImage")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    
    // Store the complete file path
    if (req.file) {
      const filePath = path.join("uploads", "category", req.file.filename);
      req.file.path = filePath;
      console.log("File saved to:", path.join(process.cwd(), filePath)); // Debug log
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
    return res.status(400).json({ message: err.message });
  }
  next(err);
};
