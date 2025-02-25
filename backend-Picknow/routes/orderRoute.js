import express from "express";
import { isAuth } from "../middelware/isAuth.js";
import {
    createDirectOrder,
    createCartOrder,
    getUserOrders,
    getOrderById,
    cancelOrder
} from "../controllers/orderController.js";

const router = express.Router();

// Order creation routes
router.post("/order/direct", isAuth, createDirectOrder);
router.post("/order/cart", isAuth, createCartOrder);

// Order management routes
router.get("/orders", isAuth, getUserOrders);
router.get("/order/:id", isAuth, getOrderById);
router.post("/order/:id/cancel", isAuth, cancelOrder);

export default router; 