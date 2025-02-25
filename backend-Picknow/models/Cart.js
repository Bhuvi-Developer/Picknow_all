import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'products',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        _id:false
    }],
    totalAmount: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

export const Cart = mongoose.model("Cart", cartSchema);