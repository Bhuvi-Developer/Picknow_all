import jwt from "jsonwebtoken";
import { Vendor } from "../models/vendor.js";

// Vendor Authentication Middleware
export const isVendorAuth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Verify that the token belongs to a vendor
        if (decoded.role !== 'vendor') {
            return res.status(403).json({ message: "Invalid token role" });
        }

        const vendor = await Vendor.findById(decoded.id).select("-password");
        if (!vendor) {
            return res.status(404).json({ message: "Vendor not found" });
        }

        req.vendor = vendor;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Token expired" });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: "Invalid token" });
        }
        return res.status(500).json({ message: "Authentication failed" });
    }
};

// Verify Vendor Status Middleware
export const isVerifiedVendor = async (req, res, next) => {
    try {
        const vendor = req.vendor;

        if (!vendor.isVerified) {
            return res.status(403).json({ 
                message: "Account not verified. Please wait for admin approval." 
            });
        }

        if (vendor.status !== 'active') {
            return res.status(403).json({ 
                message: `Account is ${vendor.status}. Please contact admin.` 
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({ 
            message: "Error verifying vendor status" 
        });
    }
};

// Check Document Verification Status
export const hasVerifiedDocuments = async (req, res, next) => {
    try {
        const vendor = req.vendor;

        // Check if all required documents are uploaded and verified
        const requiredDocs = ['aadhar', 'pan', 'gst', 'fssai'];
        const missingDocs = requiredDocs.filter(doc => 
            !vendor.documents[doc] || 
            !vendor.documents[doc].number || 
            !vendor.documents[doc].photo || 
            !vendor.documents[doc].document
        );

        if (missingDocs.length > 0) {
            return res.status(403).json({
                message: `Missing or incomplete documents: ${missingDocs.join(', ')}`,
                missingDocs
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({ 
            message: "Error checking document verification status" 
        });
    }
}; 