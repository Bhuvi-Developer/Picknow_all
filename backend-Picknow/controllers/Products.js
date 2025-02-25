import productModel from "../models/Product.js";
import mongoose from "mongoose";
import { deleteFiles, getFullPath } from "../utils/fileUtils.js";
import fs from "fs";

// Add new product
export const createProduct = async (req, res) => {
  try {
    // Fix role check logic - use OR operator
    if (req.user.role !== "admin" && req.user.role !== "super_admin") {
      return res.status(403).json({
        success: false, 
        message: "Unauthorized Access",
      });
    }

    const {
      pName,
      pShortDescription, 
      pDescription,
      pCategory,
      pSubCategory,
      pNestedSubCategory,
      pPrice,
      pPreviousPrice,
      pQuantity,
      pStock,
      pOffer,
      pTax,
      pStatus,
      pBrand
    } = req.body;

    console.log('Received product data:', {
      pName,
      pShortDescription,
      pDescription,
      pCategory,
      pSubCategory,
      pPrice,
      pPreviousPrice,
      pQuantity,
      pStock,
      pOffer,
      pTax,
      pStatus,
      pBrand
    });

    // Check if files were uploaded
    if (!req.files || !Array.isArray(req.files)) {
      return res.status(400).json({ 
        success: false,
        message: "Please upload product images" 
      });
    }
    
    const pImage = req.files;
    console.log('Received files:', pImage);

    // Validate required fields
    const requiredFields = {
      pName,
      pShortDescription,
      pDescription, 
      pCategory,
      pSubCategory,
      pPrice,
      pQuantity,
      pStock,
      pOffer,
      pTax,
      pStatus,
      pBrand
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }

    // Validate numeric fields
    const numericValidations = [
      { value: pPrice, field: 'Price', min: 0 },
      { value: pStock, field: 'Stock', min: 0 },
      { value: pTax, field: 'Tax', min: 0 }
    ];

    for (const validation of numericValidations) {
      const num = Number(validation.value);
      if (isNaN(num) || num < validation.min) {
        return res.status(400).json({ 
          success: false,
          message: `${validation.field} must be a number greater than ${validation.min}` 
        });
      }
    }

    // Process image files
    const Images = pImage.map((file) => file.filename);
    console.log('Processed images:', Images);

    // Create product data object
    const productData = {
      pName,
      pShortDescription,
      pDescription,
      pCategory,
      pSubCategory,
      pNestedSubCategory: pNestedSubCategory || '',
      pPrice: Number(pPrice),
      pPreviousPrice: Number(pPreviousPrice || 0),
      pQuantity,
      pStock: Number(pStock),
      pImage: Images,
      pOffer,
      pTax: Number(pTax),
      pStatus,
      pBrand,
      pSold: 0
    };

    console.log('Creating product with data:', productData);
    const product = await productModel.create(productData);
    console.log('Created product with nested subcategory:', product.pNestedSubCategory);

    // Transform the response
    const responseProduct = {
      ...product.toObject(),
      pImage: product.pImage.map(img => `http://localhost:5000/uploads/${img}`)
    };

    console.log('Sending response:', {
      success: true,
      message: "Product added successfully",
      product: responseProduct
    });

    return res.status(201).json({
      success: true,
      message: "Product added successfully",
      product: {
        ...product.toObject(),
        pImage: product.pImage.map(img => `http://localhost:5000/uploads/${img}`)
      }
    });

  } catch (error) {
    console.error("Error creating product:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create product",
      error: error.message
    });
  }
};

// Get all products (public access)
export const getAllProducts = async (req, res) => {
    try {
        const products = await productModel.find().sort({ createdAt: -1 });
         res.status(200).json({
            success: true,
            count: products.length,
            products: products.map(product => ({
                ...product._doc,
                pImage: product.pImage.map(img => `http://localhost:5000/uploads/${img}`)
            }))
        });
    } catch (error) {
        console.error("Error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Error fetching products"
        });
    }
};

// Get a single product by ID (public access)
export const getProductById = async (req, res) => {
    try {
        const productId = req.params.id || req.query.id;
        
        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "Product ID is required"
            });
        }

        const id = new mongoose.Types.ObjectId(productId);
        const product = await productModel.findById(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.status(200).json({
            success: true,
            product: {
                ...product._doc,
                pImage: product.pImage.map(img => `http://localhost:5000/uploads/${img}`)
            }
        });
    } catch (error) {
        console.error("Error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Error fetching product"
        });
    }
};

// Update a product by ID
export const updateProduct = async (req, res) => {
  try {
    // Validate product ID
    const productId = req.query.id;
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    // Get existing product
    const existingProduct = await productModel.findById(productId);
    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    const {
      pName,
      pShortDescription,
      pDescription,
      pCategory,
      pSubCategory,
      pNestedSubCategory,
      pPrice,
      pPreviousPrice,
      pQuantity,
      pStock,
      pOffer,
      pTax,
      pStatus,
      pBrand,
      imagesToDelete
    } = req.body;

    // Build update object
    const updateData = {
      ...(pName && { pName }),
      ...(pShortDescription && { pShortDescription }),
      ...(pDescription && { pDescription }),
      ...(pCategory && { pCategory }),
      ...(pSubCategory && { pSubCategory }),
      ...(typeof pNestedSubCategory !== 'undefined' && { pNestedSubCategory }),
      ...(typeof pPrice !== 'undefined' && { pPrice: Number(pPrice) }),
      ...(typeof pPreviousPrice !== 'undefined' && { pPreviousPrice: Number(pPreviousPrice) }),
      ...(pQuantity && { pQuantity }),
      ...(typeof pStock !== 'undefined' && { pStock: Number(pStock) }),
      ...(pOffer && { pOffer }),
      ...(typeof pTax !== 'undefined' && { pTax: Number(pTax) }),
      ...(pStatus && { pStatus }),
      ...(pBrand && { pBrand })
    };

    // Validate numeric fields
    if (typeof pPrice !== 'undefined') {
      const numericPrice = Number(pPrice);
      if (isNaN(numericPrice) || numericPrice <= 0) {
        return res.status(400).json({ message: 'Invalid price value' });
      }
    }

    if (typeof pStock !== 'undefined') {
      const numericStock = Number(pStock);
      if (isNaN(numericStock) || numericStock < 0) {
        return res.status(400).json({ message: 'Invalid stock value' });
      }
    }

    // Handle image updates
    let updatedImages = [...existingProduct.pImage]; // Start with existing images

    // Delete specific images if requested
    if (imagesToDelete) {
      const imagesToDeleteArray = JSON.parse(imagesToDelete);
      imagesToDeleteArray.forEach(filename => {
        const imagePath = getFullPath(`uploads/${filename}`);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
        updatedImages = updatedImages.filter(img => img !== filename);
      });
    }

    // Add new images
    if (req.files && req.files.length > 0) {
      const newImageFilenames = req.files.map(file => file.filename);
      updatedImages = [...updatedImages, ...newImageFilenames];
    }

    updateData.pImage = updatedImages;

    // Perform the update
    const updatedProduct = await productModel.findByIdAndUpdate(
      productId,
      updateData,
      { 
        new: true,
        runValidators: true
      }
    );

    // Send detailed response
    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: {
        ...updatedProduct._doc,
        pImage: updatedProduct.pImage.map(img => `http://localhost:5000/uploads/${img}`)
      }
    });

  } catch (error) {
    console.error("Error updating product:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Error updating product",
      error: error.message
    });
  }
};

// Delete a product by ID
export const deleteProduct = async (req, res) => {
  try {
    const product = await productModel.findById(req.query.id);
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: "Product not found.",
        showPopup: true
      });
    }

    // Delete associated image files
    if (product.pImage && product.pImage.length > 0) {
      const imagePaths = product.pImage.map(filename => getFullPath(`uploads/${filename}`));
      deleteFiles(imagePaths);
    }

    // Delete the product from database
    await product.deleteOne();

    res.status(200).json({ 
      success: true,
      message: "Product deleted successfully.",
      showPopup: true
    });
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
      showPopup: true
    });
  }
};


// Add rating and review
export const addRatingAndReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, review } = req.body;
    const userId = req.user._id;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5"
      });
    }

    // Validate productId
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required"
      });
    }

    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    // Check if user has already reviewed
    const existingReview = product.pRatingsReviews.find(
      r => r.user.toString() === userId.toString()
    );

    if (existingReview) {
      // Update existing review
      existingReview.rating = rating.toString();
      existingReview.review = review;
      existingReview.createdAt = new Date();
    } else {
      // Add new review
      product.pRatingsReviews.push({
        user: userId,
        rating: rating.toString(),
        review,
        createdAt: new Date()
      });
    }

    await product.save();

    res.status(200).json({
      success: true,
      message: "Rating and review added successfully",
      product
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Error adding rating and review"
    });
  }
};

// Get product ratings and reviews
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    // Validate productId
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format"
      });
    }

    const product = await productModel.findById(productId)
      .populate({
        path: 'pRatingsReviews.user',
        select: 'name email'
      });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    const totalRatings = product.pRatingsReviews.length;
    const avgRating = totalRatings > 0 
      ? product.pRatingsReviews.reduce((sum, item) => sum + Number(item.rating), 0) / totalRatings
      : 0;

    const response = {
      success: true,
      reviews: product.pRatingsReviews,
      totalReviews: totalRatings,
      averageRating: avgRating.toFixed(1)
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error in getProductReviews:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching reviews",
      error: error.message
    });
  }
};

// Delete a review
export const deleteReview = async (req, res) => {
  try {
    const { productId, reviewId } = req.params;
    const userId = req.user._id;

    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    // Find review index
    const reviewIndex = product.pRatingsReviews.findIndex(
      review => review._id.toString() === reviewId && review.user.toString() === userId.toString()
    );

    if (reviewIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Review not found or unauthorized"
      });
    }

    // Remove review
    product.pRatingsReviews.splice(reviewIndex, 1);
    await product.save();

    res.status(200).json({
      success: true,
      message: "Review deleted successfully"
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Error deleting review"
    });
  }
};