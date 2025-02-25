import axiosInstance from './baseApi';

export const userApi = {
  getProfile: async () => {
    try {
      const response = await axiosInstance.get('/user/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch profile' };
    }
  },

  updateProfile: async (userData) => {
    try {
      const response = await axiosInstance.put('/user/update', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update profile' };
    }
  },

  changePassword: async (password) => {
    try {
      const response = await axiosInstance.put('/user/change-password', { password });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to change password' };
    }
  }
}; 