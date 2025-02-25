import axiosInstance from './axiosInstance';
import { transformImageUrl } from './utils';

export const productApi = {
  getAllProducts: async () => {
    try {
      const response = await axiosInstance.get('/products');
      
      if (response.data.products) {
        response.data.products = response.data.products.map(product => ({
          ...product,
          pImage: Array.isArray(product.pImage) 
            ? product.pImage.map(transformImageUrl)
            : []
        }));
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch products' };
    }
  },

  getProductById: async (id) => {
    try {
      const response = await axiosInstance.get(`/product/${id}`);
      if (response.data.product) {
        response.data.product.pImage = response.data.product.pImage.map(transformImageUrl);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch product' };
    }
  },

  searchProducts: (query) => axiosInstance.get('/products/search', { params: { q: query } }),
  getProductsByCategory: (categoryId) => axiosInstance.get(`/products/category/${categoryId}`),

  // Add review methods
  addReview: async (productId, rating, review) => {
    try {
      const response = await axiosInstance.post(`/product/${productId}/reviews`, {
        rating,
        review
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to add review' };
    }
  },

  getReviews: async (productId) => {
    try {
      const response = await axiosInstance.get(`/product/${productId}/reviews`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch reviews' };
    }
  },

  deleteReview: async (productId, reviewId) => {
    try {
      const response = await axiosInstance.delete(`/product/${productId}/reviews/${reviewId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete review' };
    }
  },

  getProductsByNestedSubCategory: async (nestedSubCategoryId) => {
    try {
      const response = await axiosInstance.get(`/products/nested-subcategory/${nestedSubCategoryId}`);
      console.log('API Response:', response.data); // Debug log
      
      if (response.data.products) {
        response.data.products = response.data.products.map(product => ({
          ...product,
          pImage: Array.isArray(product.pImage) 
            ? product.pImage.map(transformImageUrl)
            : []
        }));
      }
      
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      throw error.response?.data || { message: 'Failed to fetch products by nested subcategory' };
    }
  }
}; 

