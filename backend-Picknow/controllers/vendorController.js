import { Vendor } from "../models/vendor.js";
import jwt from "jsonwebtoken";

// Register new vendor
export const registerVendor = async (req, res) => {
    try {
        const {
            displayName,
            email,
            password,
            contact,
            address,
            aadharNumber,
            panNumber,
            gstNumber,
            fssaiNumber,
            bankAccountNumber,
            ifscCode
        } = req.body;

        // Check if vendor already exists
        const existingVendor = await Vendor.findOne({ email });
        if (existingVendor) {
            return res.status(400).json({ message: "Vendor with this email already exists" });
        }

        // Check if required files are uploaded
        if (!req.files || !req.files.aadharPhoto || !req.files.panPhoto || !req.files.gstDocument || !req.files.fssaiDocument) {
            return res.status(400).json({ message: "Please upload all required documents" });
        }

        // Check for duplicate document numbers
        const duplicateAadhar = await Vendor.findOne({ "documents.aadhar.number": aadharNumber });
        if (duplicateAadhar) {
            return res.status(400).json({ message: "Aadhar number already registered" });
        }

        const duplicatePan = await Vendor.findOne({ "documents.pan.number": panNumber });
        if (duplicatePan) {
            return res.status(400).json({ message: "PAN number already registered" });
        }

        const duplicateGst = await Vendor.findOne({ "documents.gst.number": gstNumber });
        if (duplicateGst) {
            return res.status(400).json({ message: "GST number already registered" });
        }

        const duplicateFssai = await Vendor.findOne({ "documents.fssai.number": fssaiNumber });
        if (duplicateFssai) {
            return res.status(400).json({ message: "FSSAI number already registered" });
        }

        const duplicateAccount = await Vendor.findOne({ "bankDetails.accountNumber": bankAccountNumber });
        if (duplicateAccount) {
            return res.status(400).json({ message: "Bank account number already registered" });
        }

        // Create new vendor
        const vendor = new Vendor({
            displayName,
            email,
            password, // Storing password as raw text as requested
            contact,
            address,
            documents: {
                aadhar: {
                    number: aadharNumber,
                    photo: req.files.aadharPhoto[0].filename
                },
                pan: {
                    number: panNumber,
                    photo: req.files.panPhoto[0].filename
                },
                gst: {
                    number: gstNumber,
                    document: req.files.gstDocument[0].filename
                },
                fssai: {
                    number: fssaiNumber,
                    document: req.files.fssaiDocument[0].filename
                }
            },
            bankDetails: {
                accountNumber: bankAccountNumber,
                ifscCode
            }
        });

        await vendor.save();

        res.status(201).json({
            message: "Vendor registration successful. Please wait for admin approval.",
            vendor: {
                id: vendor._id,
                displayName: vendor.displayName,
                email: vendor.email,
                status: vendor.status
            }
        });
    } catch (error) {
        console.error("Vendor registration error:", error);
        res.status(500).json({ message: "Registration failed", error: error.message });
    }
};

// Vendor Login
export const loginVendor = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const vendor = await Vendor.findOne({ email });
        if (!vendor) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Direct password comparison since we're storing raw passwords
        if (password !== vendor.password) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Check vendor status
        if (!vendor.isVerified) {
            return res.status(403).json({ message: "Account is not verified. Please wait for admin approval." });
        }

        if (vendor.status === 'inactive') {
            return res.status(403).json({ message: "Account is inactive. Please contact admin." });
        }

        if (vendor.status === 'suspended') {
            return res.status(403).json({ message: "Account is suspended. Please contact admin." });
        }

        const token = vendor.generateAuthToken();

        res.status(200).json({
            message: "Login successful",
            vendor: {
                id: vendor._id,
                displayName: vendor.displayName,
                email: vendor.email,
                status: vendor.status
            },
            token
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Login failed" });
    }
};

// Get vendor profile
export const getVendorProfile = async (req, res) => {
    try {
        const vendor = await Vendor.findById(req.user.id).select('-password');
        if (!vendor) {
            return res.status(404).json({ message: "Vendor not found" });
        }
        res.status(200).json({ vendor });
    } catch (error) {
        console.error("Error fetching vendor profile:", error);
        res.status(500).json({ message: "Failed to fetch vendor profile" });
    }
};

// Update vendor profile
export const updateVendorProfile = async (req, res) => {
    try {
        const { displayName, contact, address } = req.body;
        
        const vendor = await Vendor.findById(req.user.id);
        if (!vendor) {
            return res.status(404).json({ message: "Vendor not found" });
        }

        // Update basic information
        if (displayName) vendor.displayName = displayName;
        if (contact) vendor.contact = contact;
        if (address) vendor.address = address;

        // Handle document updates if files are provided
        if (req.files) {
            if (req.files.aadharPhoto) {
                vendor.documents.aadhar.photo = req.files.aadharPhoto[0].filename;
            }
            if (req.files.panPhoto) {
                vendor.documents.pan.photo = req.files.panPhoto[0].filename;
            }
            if (req.files.gstDocument) {
                vendor.documents.gst.document = req.files.gstDocument[0].filename;
            }
            if (req.files.fssaiDocument) {
                vendor.documents.fssai.document = req.files.fssaiDocument[0].filename;
            }
        }

        await vendor.save();

        res.status(200).json({
            message: "Profile updated successfully",
            vendor: {
                id: vendor._id,
                displayName: vendor.displayName,
                email: vendor.email,
                contact: vendor.contact,
                address: vendor.address
            }
        });
    } catch (error) {
        console.error("Error updating vendor profile:", error);
        res.status(500).json({ message: "Failed to update profile" });
    }
};

// Admin Only Controllers

// Get all vendors (Admin only)
export const getAllVendors = async (req, res) => {
    try {
        const { status } = req.query;
        let query = {};

        if (status) {
            query.status = status;
        }

        const vendors = await Vendor.find(query)
            .select('-password')
            .sort({ createdAt: -1 });

        res.status(200).json({
            count: vendors.length,
            vendors
        });
    } catch (error) {
        console.error("Error fetching vendors:", error);
        res.status(500).json({ message: "Failed to fetch vendors" });
    }
};

// Get vendor by ID (Admin only)
export const getVendorById = async (req, res) => {
    try {
        const vendor = await Vendor.findById(req.query.id).select('-password');
        if (!vendor) {
            return res.status(404).json({ message: "Vendor not found" });
        }
        res.status(200).json({ vendor });
    } catch (error) {
        console.error("Error fetching vendor:", error);
        res.status(500).json({ message: "Failed to fetch vendor details" });
    }
};

// Update vendor status (Admin only)
export const updateVendorStatus = async (req, res) => {
    try {
        const { id } = req.query;
        const { status, isVerified } = req.body;

        const vendor = await Vendor.findById(id);
        if (!vendor) {
            return res.status(404).json({ message: "Vendor not found" });
        }

        if (status) {
            vendor.status = status;
        }
        if (isVerified !== undefined) {
            vendor.isVerified = isVerified;
        }

        await vendor.save();

        res.status(200).json({
            message: "Vendor status updated successfully",
            vendor: {
                id: vendor._id,
                displayName: vendor.displayName,
                email: vendor.email,
                status: vendor.status,
                isVerified: vendor.isVerified
            }
        });
    } catch (error) {
        console.error("Error updating vendor status:", error);
        res.status(500).json({ message: "Failed to update vendor status" });
    }
};

// Delete vendor (Admin only)
export const deleteVendor = async (req, res) => {
    try {
        const vendor = await Vendor.findByIdAndDelete(req.query.id);
        if (!vendor) {
            return res.status(404).json({ message: "Vendor not found" });
        }
        res.status(200).json({ message: "Vendor deleted successfully" });
    } catch (error) {
        console.error("Error deleting vendor:", error);
        res.status(500).json({ message: "Failed to delete vendor" });
    }
}; 