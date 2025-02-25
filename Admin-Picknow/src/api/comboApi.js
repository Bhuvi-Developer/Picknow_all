import axiosInstance from './axiosInstance';

const checkAdminAccess = () => {
  const token = localStorage.getItem('token');
  const userType = localStorage.getItem('userType');
  const isLoggedIn = localStorage.getItem('isLoggedIn');

  if (!token || !isLoggedIn || userType !== 'admin') {
    throw new Error('Unauthorized access. Please login as admin.');
  }
};

const dataURLtoFile = (dataurl, filename) => {
  try {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  } catch (error) {
    console.error('Error converting data URL to file:', error);
    throw new Error('Invalid image format');
  }
};

export const comboApi = {
  getAllCombos: async () => {
    try {
      checkAdminAccess();
      const response = await axiosInstance.get('/admin/combo/all');
      return response.data;
    } catch (error) {
      if (error.message === 'Unauthorized access. Please login as admin.') {
        throw { message: error.message };
      }
      throw error.response?.data || { message: 'Failed to fetch combos' };
    }
  },

  getComboById: async (id) => {
    try {
      checkAdminAccess();
      const response = await axiosInstance.get(`/admin/combo?id=${id}`);
      return response.data;
    } catch (error) {
      if (error.message === 'Unauthorized access. Please login as admin.') {
        throw { message: error.message };
      }
      throw error.response?.data || { message: 'Failed to fetch combo' };
    }
  },

  createCombo: async (comboData) => {
    try {
      const token = checkAdminAccess();
      const formData = new FormData();

      // Add basic combo data
      formData.append('ccName', comboData.name);
      formData.append('ccDescription', comboData.description);
      formData.append('ccPrice', comboData.price);
      formData.append('ccOffer', comboData.offer || '0');
      formData.append('ccQuantity', comboData.quantity || '0');
      formData.append('ccStatus', comboData.status);
      
      // Add product IDs
      if (Array.isArray(comboData.products)) {
        const productIds = comboData.products.map(p => p._id);
        formData.append('productIds', JSON.stringify(productIds));
      }

      // Handle image upload
      if (Array.isArray(comboData.images)) {
        const validImages = comboData.images.filter(image => image);
        
        validImages.forEach((image, index) => {
          if (typeof image === 'string' && image.startsWith('data:image')) {
            const imageFile = dataURLtoFile(image, `combo-image-${Date.now()}-${index}.jpg`);
            formData.append('ccImage', imageFile);
          } else if (image instanceof File) {
            formData.append('ccImage', image);
          }
        });
      }

      const response = await axiosInstance.post('/admin/combo/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
      });
      return response.data;
    } catch (error) {
      console.error('Create combo error:', error.response?.data || error.message);
      if (error.message === 'Unauthorized access. Please login as admin.') {
        throw { message: error.message };
      }
      throw error.response?.data || { message: 'Failed to create combo' };
    }
  },

  updateCombo: async (id, comboData) => {
    try {
      checkAdminAccess();
      const formData = new FormData();

      // Add basic combo data
      formData.append('ccName', comboData.name);
      formData.append('ccDescription', comboData.description);
      formData.append('ccPrice', comboData.price.toString());
      formData.append('ccOffer', (comboData.offer || '0').toString());
      formData.append('ccQuantity', (comboData.quantity || '1').toString());
      formData.append('ccStatus', comboData.status);
      
      // Add product IDs
      if (Array.isArray(comboData.products)) {
        const productIds = comboData.products.map(p => p._id);
        formData.append('productIds', JSON.stringify(productIds));
      }

      // Handle image upload
      if (Array.isArray(comboData.images)) {
        const validImages = comboData.images.filter(image => image);
        validImages.forEach((image, index) => {
          if (typeof image === 'string' && image.startsWith('data:image')) {
            const imageFile = dataURLtoFile(image, `combo-image-${Date.now()}-${index}.jpg`);
            formData.append('ccImage', imageFile);
          } else if (image instanceof File) {
            formData.append('ccImage', image);
          }
        });
      }

      const response = await axiosInstance.put(`/admin/combo/update?id=${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
      });
      return response.data;
    } catch (error) {
      console.error('Update combo error:', error.response?.data || error.message);
      throw error.response?.data || { message: 'Failed to update combo' };
    }
  },

  deleteCombo: async (id) => {
    try {
      checkAdminAccess();
      const response = await axiosInstance.delete(`/admin/combo/delete?id=${id}`);
      return response.data;
    } catch (error) {
      if (error.message === 'Unauthorized access. Please login as admin.') {
        throw { message: error.message };
      }
      throw error.response?.data || { message: 'Failed to delete combo' };
    }
  }
};

export default comboApi; 