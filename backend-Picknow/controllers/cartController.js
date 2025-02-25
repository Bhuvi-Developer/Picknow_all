import { Cart } from "../models/Cart.js";
import productModel from "../models/Product.js";

// Add to cart
export const addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const userId = req.user._id;

        // Input validation
        if (!productId || !quantity || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID or quantity"
            });
        }

        // Validate product existence and stock
        const product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        if (product.pStock < quantity) {
            return res.status(400).json({
                success: false,
                message: "Insufficient stock"
            });
        }

        // Find user's cart or create new one
        let cart = await Cart.findOne({ user: userId });
        
        if (!cart) {
            cart = new Cart({ user: userId, items: [], totalAmount: 0 });
        }

        // Check if product already exists in cart
        const existingItemIndex = cart.items.findIndex(
            item => item.product.toString() === productId
        );

        if (existingItemIndex > -1) {
            // Update quantity if product exists
            cart.items[existingItemIndex].quantity += quantity;
        } else {
            // Add new item if product doesn't exist
            cart.items.push({
                product: productId,
                quantity
            });
        }

        // Calculate total amount
        const populatedCart = await cart.populate('items.product');
        cart.totalAmount = populatedCart.items.reduce((total, item) => {
            return total + (item.product.pPrice * item.quantity);
        }, 0);

        await cart.save();

        // Return populated cart with all necessary fields
        const finalCart = await Cart.findById(cart._id).populate({
            path: 'items.product',
            select: 'pName pPrice pQuantity pImage pOffer pStock'
        });

        res.status(200).json({
            success: true,
            message: "Product added to cart successfully",
            cart: finalCart
        });

    } catch (error) {
        console.error("Add to cart error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to add item to cart"
        });
    }
};

// Get cart
export const getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id })
            .populate({
                path: 'items.product',
                model: 'products',
                select: 'pName pPrice pQuantity pImage pOffer pStock'
            });

        if (!cart) {
            // If no cart exists, return empty cart
            return res.json({
                success: true,
                cart: {
                    items: [],
                    totalAmount: 0
                }
            });
        }

        res.json({
            success: true,
            cart: cart
        });
    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch cart'
        });
    }
};

// Update cart item quantity
export const updateCartItem = async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        if (quantity < 1) {
            return res.status(400).json({ message: "Quantity must be at least 1" });
        }

        // Check product stock
        const product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        if (product.pStock < quantity) {
            return res.status(400).json({ message: "Insufficient stock" });
        }

        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        const itemIndex = cart.items.findIndex(
            item => item.product.toString() === productId
        );

        if (itemIndex === -1) {
            return res.status(404).json({ message: "Product not found in cart" });
        }

        cart.items[itemIndex].quantity = quantity;

        // Recalculate total amount
        const populatedCart = await cart.populate('items.product');
        cart.totalAmount = populatedCart.items.reduce((total, item) => {
            return total + (item.product.pPrice * item.quantity);
        }, 0);

        await cart.save();

        const updatedCart = await Cart.findById(cart._id)
            .populate('items.product');

        res.status(200).json({
            message: "Cart updated successfully",
            cart: updatedCart
        });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ message: error.message });
    }
};

// Remove item from cart
export const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.query;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "Product ID is required"
            });
        }

        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        // Remove the item from cart
        cart.items = cart.items.filter(
            item => item.product.toString() !== productId
        );

        // Recalculate total amount
        const populatedCart = await cart.populate('items.product');
        cart.totalAmount = populatedCart.items.reduce((total, item) => {
            return total + (item.product.pPrice * item.quantity);
        }, 0);

        await cart.save();

        // Return populated cart
        const updatedCart = await Cart.findById(cart._id).populate({
            path: 'items.product',
            select: 'pName pPrice pQuantity pImage pOffer pStock'
        });

        res.status(200).json({
            success: true,
            message: "Item removed from cart successfully",
            cart: updatedCart
        });
    } catch (error) {
        console.error("Remove from cart error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to remove item from cart"
        });
    }
};

// Clear cart
export const clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        cart.items = [];
        cart.totalAmount = 0;
        await cart.save();

        res.status(200).json({
            message: "Cart cleared successfully",
            cart
        });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ message: error.message });
    }
};