import express from "express";
import { isAdminAuth, isAdmin } from "../middelware/isAdminAuth.js";
import { uploadComboFiles } from "../middelware/comboMulter.js";
import { 
    createCombo,
    getAllCombos,
    getComboById,
    updateCombo,
    deleteCombo
} from "../controllers/comboController.js";

const router = express.Router();

// Admin routes (protected)
router.post("/admin/combo/create", isAdminAuth, isAdmin, uploadComboFiles, createCombo);
router.get("/admin/combo/all", isAdminAuth, isAdmin, getAllCombos);
router.get("/admin/combo", isAdminAuth, isAdmin, getComboById);
router.put("/admin/combo/update", isAdminAuth, isAdmin, uploadComboFiles, updateCombo);
router.delete("/admin/combo/delete", isAdminAuth, isAdmin, deleteCombo);

export default router; 