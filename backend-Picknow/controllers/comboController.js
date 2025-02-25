import { comboModel } from "../models/combo.js";
import productModel from "../models/Product.js";
import { deleteFiles, getFullPath } from "../utils/fileUtils.js";
import path from 'path';

// Create new combo
export const createCombo = async (req, res) => {
    try {
        // Ensure user is admin
        if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'super_admin')) {
            return res.status(403).json({ 
                success: false,
                message: "Only admins can create combos",
                userRole: req.user?.role || 'none'
            });
        }

        const {
            ccName,
            ccDescription,
            ccPrice,
            ccOffer,
            ccQuantity,
            ccStatus,
            productIds
        } = req.body;

        // Check if files were uploaded
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false, 
                message: "At least one image is required."
            });
        }

        // Parse productIds if it's a string
        let parsedProductIds = productIds;
        if (typeof productIds === 'string') {
            try {
                parsedProductIds = JSON.parse(productIds);
            } catch (e) {
                parsedProductIds = [productIds]; // If it's a single ID
            }
        }

        // Validate required fields
        if (!ccName || !ccDescription || !ccPrice || !ccQuantity || !parsedProductIds) {
            return res.status(400).json({ 
                success: false,
                message: "All fields are required.",
                received: {
                    ccName,
                    ccDescription,
                    ccPrice,
                    ccQuantity,
                    productIds: parsedProductIds
                }
            });
        }

        // Validate products exist
        const products = await productModel.find({ _id: { $in: parsedProductIds } });
        
        if (products.length !== parsedProductIds.length) {
            return res.status(400).json({ 
                success: false,
                message: "One or more products not found.",
                foundProducts: products.length,
                requestedProducts: parsedProductIds.length
            });
        }

        const Images = req.files.map((file) => `combo/${path.basename(file.path)}`);

        const comboData = {
            ccName,
            ccDescription,
            ccPrice: Number(ccPrice),
            ccOffer: Number(ccOffer || 0),
            ccQuantity: Number(ccQuantity),
            ccStatus: ccStatus || 'active',
            ccImage: Images,
            ccProducts: parsedProductIds
        };

        const combo = await comboModel.create(comboData);

        res.status(201).json({
            success: true,
            message: "Combo created successfully.",
            combo
        });
    } catch (error) {
        console.error("Error creating combo:", error);
        res.status(500).json({ 
            success: false,
            message: "Internal server error",
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// Get all combos
export const getAllCombos = async (req, res) => {
    try {
        const combos = await comboModel.find().populate('ccProducts');
        res.status(200).json({
            success: true,
            count: combos.length,
            combos
        });
    } catch (error) {
        console.error("Error fetching combos:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching combos"
        });
    }
};

// Get combo by ID
export const getComboById = async (req, res) => {
    try {
        const combo = await comboModel.findById(req.query.id).populate('ccProducts');
        if (!combo) {
            return res.status(404).json({
                success: false,
                message: "Combo not found"
            });
        }
        res.status(200).json({
            success: true,
            combo
        });
    } catch (error) {
        console.error("Error fetching combo:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching combo"
        });
    }
};

// Update combo
export const updateCombo = async (req, res) => {
    try {
        console.log("Update request body:", req.body);
        console.log("Update request files:", req.files);

        // Ensure user is admin
        if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'super_admin')) {
            return res.status(403).json({ message: "Only admins can update combos" });
        }

        const combo = await comboModel.findById(req.query.id);
        if (!combo) {
            return res.status(404).json({ message: "Combo not found" });
        }

        const {
            ccName,
            ccDescription,
            ccPrice,
            ccOffer,
            ccQuantity,
            ccStatus,
            productIds
        } = req.body;

        // Validate required fields
        if (!ccName || !ccDescription || !ccPrice || !ccQuantity) {
            return res.status(400).json({ 
                message: "Missing required fields",
                received: {
                    ccName,
                    ccDescription,
                    ccPrice,
                    ccQuantity
                }
            });
        }

        // Parse productIds if it's a string
        let parsedProductIds = productIds;
        if (typeof productIds === 'string') {
            try {
                parsedProductIds = JSON.parse(productIds);
            } catch (e) {
                console.error("Error parsing productIds:", e);
                return res.status(400).json({ 
                    message: "Invalid product IDs format",
                    received: productIds
                });
            }
        }

        // Validate products exist
        const products = await productModel.find({ _id: { $in: parsedProductIds } });
        if (products.length !== parsedProductIds.length) {
            return res.status(400).json({ 
                message: "One or more products not found",
                found: products.length,
                requested: parsedProductIds.length,
                requestedIds: parsedProductIds
            });
        }

        // Update combo fields
        combo.ccName = ccName;
        combo.ccDescription = ccDescription;
        combo.ccPrice = Number(ccPrice);
        combo.ccOffer = Number(ccOffer || 0);
        combo.ccQuantity = Number(ccQuantity);
        combo.ccStatus = ccStatus || combo.ccStatus;
        combo.ccProducts = parsedProductIds;

        // Update images if provided
        if (req.files && req.files.length > 0) {
            combo.ccImage = req.files.map(file => `combo/${path.basename(file.path)}`);
        }

        await combo.save();

        res.status(200).json({
            success: true,
            message: "Combo updated successfully",
            combo
        });

    } catch (error) {
        console.error("Error updating combo:", error);
        res.status(500).json({ 
            success: false,
            message: "Internal server error",
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

export const deleteCombo = async (req, res) => {
    try {
        // Ensure user is admin
        if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'super_admin')) {
            return res.status(403).json({ message: "Only admins can delete combos" });
        }

        const combo = await comboModel.findById(req.query.id);
        if (!combo) {
            return res.status(404).json({ message: "Combo not found" });
        }

        // Delete associated image files
        if (combo.ccImage && combo.ccImage.length > 0) {
            const imagePaths = combo.ccImage.map(imagePath => getFullPath(`uploads/${imagePath}`));
            deleteFiles(imagePaths);
        }

        // Delete the combo from database
        await combo.deleteOne();

        res.status(200).json({ message: "Combo deleted successfully" });
    } catch (error) {
        console.error("Error deleting combo:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}; 