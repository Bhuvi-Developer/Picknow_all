import express from "express";
import { isAdminAuth, isAdmin } from "../middelware/isAdminAuth.js";
import { uploadFiles } from "../middelware/multer.js";
import { 
    createProduct, 
    deleteProduct, 
    getAllProducts, 
    getProductById, 
    updateProduct 
} from "../controllers/Products.js";
import { getProductsByCategory } from "../controllers/categoryControll.js";
import { isAuth } from "../middelware/isAuth.js";
import { addRatingAndReview, getProductReviews, deleteReview } from "../controllers/Products.js";
import Product from "../models/Product.js";
import { categoryModel as Category } from "../models/Category.js";

const router = express.Router();

// Admin routes (protected)
router.post("/admin/product/new", isAdminAuth, isAdmin, uploadFiles, createProduct);
router.get("/admin/product/all", isAdminAuth, isAdmin, getAllProducts);
router.get("/admin/product/", isAdminAuth, isAdmin, getProductById);
router.put("/admin/product/", isAdminAuth, isAdmin, uploadFiles, updateProduct);
router.delete("/admin/product/", isAdminAuth, isAdmin, deleteProduct);

// Public routes (no authentication required)
router.get("/products", getAllProducts);           // Get all products
router.get("/product/:id", getProductById);       // Get single product by ID
router.get("/product/category/:category", getProductsByCategory); // Get products by category
router.post('/product/:productId/reviews', isAuth, addRatingAndReview);
router.get('/product/:productId/reviews', getProductReviews);
router.delete('/product/:productId/reviews/:reviewId', isAuth, deleteReview);

// Add this new route for nested subcategory products
router.get("/products/nested-subcategory/:nestedSubCategory", async (req, res) => {
  try {
    const { nestedSubCategory } = req.params;
    
    // First get the nested subcategory name
    const category = await Category.findOne({
      'subCategories.subCategories._id': nestedSubCategory
    });
    
    if (!category) {
      return res.json({ success: true, products: [], message: 'Category not found' });
    }

    // Find the nested subcategory name
    let nestedSubCategoryName = '';
    category.subCategories.forEach(sub => {
      sub.subCategories.forEach(nested => {
        if (nested._id.toString() === nestedSubCategory) {
          nestedSubCategoryName = nested.name;
        }
      });
    });

    console.log('Looking for products with nested subcategory:', {
      id: nestedSubCategory,
      name: nestedSubCategoryName
    });

    // Find products using the name
    const products = await Product.find({ 
      pNestedSubCategory: nestedSubCategoryName 
    });
    
    console.log('Query results:', {
      searchedName: nestedSubCategoryName,
      matchingProducts: products.length,
      matchingProductDetails: products.map(p => ({
        id: p._id,
        name: p.pName,
        nestedSubCategory: p.pNestedSubCategory
      }))
    });

    // Transform product images
    const transformedProducts = products.map(product => ({
      ...product.toObject(),
      pImage: product.pImage.map(img => `http://localhost:5000/uploads/${img}`)
    }));

    res.json({ 
      success: true, 
      products: transformedProducts,
      debug: {
        nestedSubCategoryId: nestedSubCategory,
        nestedSubCategoryName: nestedSubCategoryName,
        matchingProducts: products.length
      }
    });
  } catch (error) {
    console.error('Backend Error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message,
      error: error.stack 
    });
  }
});

export default router;