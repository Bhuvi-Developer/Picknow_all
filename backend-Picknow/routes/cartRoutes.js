import express from "express";
import { isAuth } from "../middelware/isAuth.js";
import {
    addToCart,
    getCart,
    updateCartItem,
    removeFromCart,
    clearCart
} from "../controllers/cartController.js";

const router = express.Router();

// Cart routes
router.post("/cart/add", isAuth, addToCart);
router.get("/cart/get", isAuth, getCart);
router.put("/cart/update", isAuth, updateCartItem);
router.delete("/cart/remove", isAuth, removeFromCart);
router.delete("/cart/clear", isAuth, clearCart);

export default router;