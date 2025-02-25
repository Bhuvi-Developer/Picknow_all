import axiosInstance from './baseApi';

export const cartApi = {
  getCart: async () => {
    try {
      const response = await axiosInstance.get('/cart/get');
      return response.data;
    } catch (error) {
      console.error('Cart API error:', error.response || error);
      throw error.response?.data || { message: 'Failed to fetch cart' };
    }
  },

  addToCart: async (productId, quantity) => {
    try {
      // Validate inputs
      if (!productId || !quantity || quantity < 1) {
        throw { message: 'Invalid product ID or quantity' };
      }

      const response = await axiosInstance.post('/cart/add', { 
        productId, 
        quantity: parseInt(quantity)  // Ensure quantity is a number
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        throw { message: 'Unauthorized access. Please login.' };
      }
      throw error.response?.data || error;
    }
  },

  updateQuantity: async (productId, quantity) => {
    try {
      const response = await axiosInstance.put('/cart/update', { 
        productId, 
        quantity 
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update quantity' };
    }
  },

  removeItem: async (productId) => {
    try {
      const response = await axiosInstance.delete('/cart/remove', { 
        params: { productId } 
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        throw { message: 'Unauthorized access. Please login.' };
      }
      throw error.response?.data || { message: 'Failed to remove item' };
    }
  },

  clearCart: async () => {
    try {
      const response = await axiosInstance.delete('/cart/clear');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to clear cart' };
    }
  }
}; 