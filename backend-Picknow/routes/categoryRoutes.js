import express from "express";
import { isAdminAuth , isAdmin } from "../middelware/isAdminAuth.js";
import { uploadFiles2 } from "../middelware/categoryMulter.js";
import { uploadSubcategoryImage } from "../middelware/subcategoryMulter.js";
import { 
  createCategory, 
  getAllCategory,
  updateCategory,
  deleteCategory,
  getCategoryById,
  getSubCategories,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
  getProductsByCategory,
  createNestedSubCategory,
  getNestedSubCategories,
  deleteNestedSubCategory,
  updateNestedSubCategory
} from "../controllers/categoryControll.js";
import upload from '../middelware/upload.js';

const router = express.Router();

// Admin routes (protected)
router.post("/admin/category/new", isAdminAuth, isAdmin, uploadFiles2, createCategory);
router.put("/admin/category/:id", isAdminAuth, isAdmin, uploadFiles2, updateCategory);
router.delete("/admin/category/:id", isAdminAuth, isAdmin, deleteCategory);

// Public routes
router.get("/category/all", getAllCategory);
router.get("/category/:id", getCategoryById);

// Subcategory routes
router.get('/category/:categoryId/subcategories', getSubCategories);
router.post('/admin/category/:categoryId/subcategories', isAdminAuth, isAdmin, uploadSubcategoryImage, createSubCategory);
router.put('/admin/category/:categoryId/subcategories/:subCategoryId', isAdminAuth, isAdmin, uploadSubcategoryImage, updateSubCategory);
router.delete('/admin/category/:categoryId/subcategories/:subCategoryId', isAdminAuth, isAdmin, deleteSubCategory);

// Add this route
router.get('/category/:categoryName/products', getProductsByCategory);

// Nested subcategory routes - Admin
router.get(
    '/admin/category/:categoryId/subcategories/:subCategoryId/nested',
    isAdminAuth,
    isAdmin,
    getNestedSubCategories
);

router.post(
    '/admin/category/:categoryId/subcategories/:parentSubCategoryId/nested',
    isAdminAuth,
    isAdmin,
    uploadSubcategoryImage,
    createNestedSubCategory
);

router.delete(
    '/admin/category/:categoryId/subcategories/:parentSubCategoryId/nested/:nestedSubCategoryId',
    isAdminAuth,
    isAdmin,
    deleteNestedSubCategory
);

router.put(
    '/admin/category/:categoryId/subcategories/:parentSubCategoryId/nested/:nestedSubCategoryId',
    isAdminAuth,
    isAdmin,
    uploadSubcategoryImage,
    updateNestedSubCategory
);

// Nested subcategory routes - Shop
router.get(
    '/category/:categoryId/subcategories/:subCategoryId/nested',
    getNestedSubCategories
);

router.post(
    '/category/:categoryId/subcategories/:parentSubCategoryId/nested',
    uploadSubcategoryImage,
    createNestedSubCategory
);

router.delete(
    '/category/:categoryId/subcategories/:parentSubCategoryId/nested/:nestedSubCategoryId',
    deleteNestedSubCategory
);

router.put(
    '/category/:categoryId/subcategories/:parentSubCategoryId/nested/:nestedSubCategoryId',
    uploadSubcategoryImage,
    updateNestedSubCategory
);

export default router;