import mongoose from "mongoose";
import jwt from "jsonwebtoken";

const vendorSchema = new mongoose.Schema({
    displayName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    contact: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    documents: {
        aadhar: {
            number: {
                type: String,
                required: true,
                unique: true,
            },
            photo: {
                type: String,
                required: true,
            }
        },
        pan: {
            number: {
                type: String,
                required: true,
                unique: true,
            },
            photo: {
                type: String,
                required: true,
            }
        },
        gst: {
            number: {
                type: String,
                required: true,
                unique: true,
            },
            document: {
                type: String,
                required: true,
            }
        },
        fssai: {
            number: {
                type: String,
                required: true,
                unique: true,
            },
            document: {
                type: String,
                required: true,
            }
        }
    },
    bankDetails: {
        accountNumber: {
            type: String,
            required: true,
            unique: true,
        },
        ifscCode: {
            type: String,
            required: true,
        }
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'inactive',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

// Method to generate auth token
vendorSchema.methods.generateAuthToken = function() {
    return jwt.sign(
        { 
            id: this._id,
            email: this.email,
            role: 'vendor'
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
};

export const Vendor = mongoose.model("Vendor", vendorSchema); 