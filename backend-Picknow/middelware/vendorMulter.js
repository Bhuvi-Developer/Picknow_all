import multer from "multer";
import { v4 as uuid } from "uuid";
import path from "path";
import fs from "fs";

const __dirname = path.resolve();

// Create necessary upload directories
const createUploadDirectories = () => {
    const directories = {
        base: path.join(__dirname, "/uploads"),
        vendor: path.join(__dirname, "/uploads/vendor"),
        documents: path.join(__dirname, "/uploads/vendor/documents"),
        profile: path.join(__dirname, "/uploads/vendor/profile")
    };

    Object.values(directories).forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });

    return directories;
};

const directories = createUploadDirectories();

// Configure storage
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        // Determine the appropriate directory based on file type
        let uploadPath = directories.documents;
        if (file.fieldname === 'profileImage') {
            uploadPath = directories.profile;
        }
        cb(null, uploadPath);
    },
    filename: function(req, file, cb) {
        const id = uuid();
        const fileExt = path.extname(file.originalname);
        const fileName = `vendor_${file.fieldname}_${id}${fileExt}`;
        cb(null, fileName);
    }
});

// File filter function
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = {
        'aadharPhoto': ['image/jpeg', 'image/png'],
        'panPhoto': ['image/jpeg', 'image/png'],
        'gstDocument': ['image/jpeg', 'image/png', 'application/pdf'],
        'fssaiDocument': ['image/jpeg', 'image/png', 'application/pdf'],
        'profileImage': ['image/jpeg', 'image/png'],
        'shopPhotos': ['image/jpeg', 'image/png']
    };

    // Check if the fieldname is allowed and has valid mime type
    if (allowedMimeTypes[file.fieldname] && 
        allowedMimeTypes[file.fieldname].includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Invalid file type for ${file.fieldname}. Allowed types: ${allowedMimeTypes[file.fieldname].join(', ')}`), false);
    }
};

// Create multer upload instance
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB file size limit
        files: 10 // Maximum number of files
    }
});

// Middleware for handling vendor document uploads
export const uploadVendorDocs = upload.fields([
    { name: 'aadharPhoto', maxCount: 1 },
    { name: 'panPhoto', maxCount: 1 },
    { name: 'gstDocument', maxCount: 1 },
    { name: 'fssaiDocument', maxCount: 1 },
    { name: 'profileImage', maxCount: 1 },
    { name: 'shopPhotos', maxCount: 5 }
]);

// Middleware for handling single profile image upload
export const uploadVendorProfile = upload.single('profileImage');

// Error handling middleware for multer
export const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        switch (err.code) {
            case 'LIMIT_FILE_SIZE':
                return res.status(400).json({ 
                    message: 'File too large. Maximum size is 5MB' 
                });
            case 'LIMIT_FILE_COUNT':
                return res.status(400).json({ 
                    message: 'Too many files uploaded' 
                });
            case 'LIMIT_UNEXPECTED_FILE':
                return res.status(400).json({ 
                    message: 'Unexpected file upload. Please check the required document types.' 
                });
            default:
                return res.status(400).json({ 
                    message: err.message 
                });
        }
    }

    if (err) {
        return res.status(400).json({ 
            message: err.message || 'Error processing file upload' 
        });
    }

    next();
};

// Cleanup middleware to remove uploaded files in case of error
export const cleanupOnError = (req, res, next) => {
    res.on('finish', () => {
        if (res.statusCode >= 400 && req.files) {
            Object.values(req.files).forEach(files => {
                files.forEach(file => {
                    fs.unlink(file.path, (err) => {
                        if (err) console.error('Error deleting file:', err);
                    });
                });
            });
        }
    });
    next();
};

// Middleware to validate required documents
export const validateRequiredDocs = (req, res, next) => {
    const requiredDocs = ['aadharPhoto', 'panPhoto', 'gstDocument', 'fssaiDocument'];
    
    if (!req.files) {
        return res.status(400).json({ 
            message: 'No files uploaded' 
        });
    }

    const missingDocs = requiredDocs.filter(doc => !req.files[doc]);
    
    if (missingDocs.length > 0) {
        return res.status(400).json({ 
            message: `Missing required documents: ${missingDocs.join(', ')}` 
        });
    }

    next();
}; 