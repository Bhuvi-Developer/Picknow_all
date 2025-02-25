import { Order } from "../models/order.js";
import { Cart } from "../models/Cart.js";
import productModel from "../models/Product.js";
import mongoose from "mongoose";

// Create order directly from product
export const createDirectOrder = async (req, res) => {
    try {
        const { 
            productId, 
            quantity, 
            variant,
            shippingAddress, 
            paymentMethod,
            orderNotes 
        } = req.body;

        // Validate product and quantity
        const product = await productModel.findById(productId);
        if (!product) {
            throw new Error("Product not found");
        }

        if (product.pStock < quantity) {
            throw new Error("Insufficient stock");
        }

        // Calculate amounts
        const price = variant ? variant.price : product.pPrice;
        const totalAmount = price * quantity;
        const tax = (totalAmount * product.pTax) / 100;
        const shippingCharges = totalAmount > 500 ? 0 : 50; // Free shipping above ₹500
        const discount = (totalAmount * product.pOffer) / 100;
        const finalAmount = totalAmount + tax + shippingCharges - discount;

        // Create order
        const order = new Order({
            user: req.user._id,
            items: [{
                product: productId,
                quantity,
                price,
                variant
            }],
            shippingAddress,
            paymentMethod,
            orderNotes,
            totalAmount,
            tax,
            shippingCharges,
            discount,
            finalAmount
        });

        // Save the order first
        await order.save();

        // Update product stock
        await productModel.findByIdAndUpdate(productId, {
            $inc: {
                pStock: -quantity,
                pSold: quantity
            }
        });

        res.status(201).json({
            success: true,
            message: "Order placed successfully",
            order
        });
    } catch (error) {
        console.error("Order creation error:", error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Create order from cart
export const createCartOrder = async (req, res) => {
    try {
        const { shippingAddress, paymentMethod, orderNotes } = req.body;

        // Get user's cart
        const cart = await Cart.findOne({ user: req.user._id })
            .populate('items.product');

        if (!cart || cart.items.length === 0) {
            throw new Error("Cart is empty");
        }

        // Validate stock for all items
        for (const item of cart.items) {
            if (item.product.pStock < item.quantity) {
                throw new Error(`Insufficient stock for ${item.product.pName}`);
            }
        }

        // Calculate amounts
        let totalAmount = 0;
        let totalTax = 0;
        let totalDiscount = 0;

        const orderItems = cart.items.map(item => {
            const price = item.variant ? item.variant.price : item.product.pPrice;
            const itemTotal = price * item.quantity;
            const itemTax = (itemTotal * item.product.pTax) / 100;
            const itemDiscount = (itemTotal * Number(item.product.pOffer)) / 100;

            totalAmount += itemTotal;
            totalTax += itemTax;
            totalDiscount += itemDiscount;

            return {
                product: item.product._id,
                quantity: item.quantity,
                price,
                variant: item.variant
            };
        });

        const shippingCharges = totalAmount > 500 ? 0 : 50; // Free shipping above ₹500
        const finalAmount = totalAmount + totalTax + shippingCharges - totalDiscount;

        // Create order
        const order = new Order({
            user: req.user._id,
            items: orderItems,
            shippingAddress,
            paymentMethod,
            orderNotes,
            totalAmount,
            tax: totalTax,
            shippingCharges,
            discount: totalDiscount,
            finalAmount
        });

        // Save the order first
        await order.save();

        // Update product stocks
        for (const item of cart.items) {
            await productModel.findByIdAndUpdate(
                item.product._id,
                {
                    $inc: {
                        pStock: -item.quantity,
                        pSold: item.quantity
                    }
                }
            );
        }

        // Clear cart
        await Cart.findByIdAndDelete(cart._id);

        res.status(201).json({
            success: true,
            message: "Order placed successfully",
            order
        });
    } catch (error) {
        console.error("Order creation error:", error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get user's orders
export const getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .populate('items.product')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            orders
        });
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching orders"
        });
    }
};

// Get order by ID
export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            user: req.user._id
        }).populate('items.product');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        res.status(200).json({
            success: true,
            order
        });
    } catch (error) {
        console.error("Error fetching order:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching order"
        });
    }
};

// Cancel order
export const cancelOrder = async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!order) {
            throw new Error("Order not found");
        }

        if (!['PENDING', 'CONFIRMED'].includes(order.orderStatus)) {
            throw new Error("Order cannot be cancelled at this stage");
        }

        // Restore product stocks
        for (const item of order.items) {
            await productModel.findByIdAndUpdate(
                item.product,
                {
                    $inc: {
                        pStock: item.quantity,
                        pSold: -item.quantity
                    }
                }
            );
        }

        order.orderStatus = 'CANCELLED';
        await order.save();

        res.status(200).json({
            success: true,
            message: "Order cancelled successfully",
            order
        });
    } catch (error) {
        console.error("Order cancellation error:", error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};