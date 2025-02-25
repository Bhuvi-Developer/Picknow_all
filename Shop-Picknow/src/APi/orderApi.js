import axiosInstance from './axiosInstance';
import { checkUserAccess } from './utils';

export const orderApi = {
  createOrder: async (orderData) => {
    try {
      checkUserAccess();
      const response = await axiosInstance.post('/order/create', orderData);
      return response.data;
    } catch (error) {
      if (error.message === 'Unauthorized access. Please login.') {
        throw { message: error.message };
      }
      throw error.response?.data || { message: 'Failed to create order' };
    }
  },

  getOrders: async () => {
    try {
      checkUserAccess();
      const response = await axiosInstance.get('/order/list');
      return response.data;
    } catch (error) {
      if (error.message === 'Unauthorized access. Please login.') {
        throw { message: error.message };
      }
      throw error.response?.data || { message: 'Failed to fetch orders' };
    }
  },

  getOrderById: (orderId) => axiosInstance.get(`/order/${orderId}`),
  cancelOrder: (orderId) => axiosInstance.put(`/order/${orderId}/cancel`)
}; 