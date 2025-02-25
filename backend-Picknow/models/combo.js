import mongoose from "mongoose";
import "./Product.js";  // Import Product model to ensure it's registered

const comboSchema = new mongoose.Schema({
    ccName: {
        type: String,
        required: true,
    },
    ccDescription: {
        type: String,
        required: true,
    },
    ccImage: {
        type: Array,
        required: true,
    },
    ccPrice: {
        type: Number,
        required: true,
    },
    ccOffer: {
        type: Number,
        default: 0,
    },
    ccQuantity: {
        type: Number,
        required: true,
    },
    ccStatus: {
        type: String,
        required: true,
        enum: ['active', 'inactive'],
        default: 'active',
    },
    ccProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'products',
        required: true
    }],
}, { timestamps: true });

export const comboModel = mongoose.model("combos", comboSchema);
export default comboModel;
