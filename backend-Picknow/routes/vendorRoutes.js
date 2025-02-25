import express from "express";
import { 
    registerVendor,
    loginVendor, 
    getVendorProfile, 
    updateVendorProfile,
    getAllVendors,
    getVendorById,
    updateVendorStatus,
    deleteVendor
} from "../controllers/vendorController.js";
import { isVendorAuth, isVerifiedVendor, hasVerifiedDocuments } from "../middelware/isVendorAuth.js";
import { isAdminAuth, isAdmin } from "../middelware/isAdminAuth.js";
import { 
    uploadVendorDocs, 
    uploadVendorProfile, 
    handleUploadError, 
    cleanupOnError, 
    validateRequiredDocs 
} from "../middelware/vendorMulter.js";

const router = express.Router();

// Public routes (no authentication required)
router.post(
    "/vendor/register", 
    uploadVendorDocs,
    handleUploadError,
    validateRequiredDocs,
    cleanupOnError,
    registerVendor
);
router.post("/vendor/login", loginVendor);

// Vendor routes (require vendor authentication)
router.get(
    "/vendor/profile", 
    isVendorAuth, 
    isVerifiedVendor, 
    getVendorProfile
);

router.patch(
    "/vendor/profile",
    isVendorAuth,
    isVerifiedVendor,
    uploadVendorProfile,
    handleUploadError,
    cleanupOnError,
    updateVendorProfile
);

// Admin routes for vendor management (require admin authentication)
router.get(
    "/vendors", 
    isAdminAuth, 
    isAdmin, 
    getAllVendors
);

router.get(
    "/vendor/:id", 
    isAdminAuth, 
    isAdmin, 
    getVendorById
);

router.patch(
    "/vendor/:id/status", 
    isAdminAuth, 
    isAdmin, 
    updateVendorStatus
);

router.delete(
    "/vendor/:id", 
    isAdminAuth, 
    isAdmin, 
    deleteVendor
);

export default router; 