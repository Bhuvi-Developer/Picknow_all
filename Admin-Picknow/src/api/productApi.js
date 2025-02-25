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

const transformImageUrl = (imagePath) => {
  if (!imagePath) return '';
  // If it's already a full URL or base64, return as is
  if (imagePath.startsWith('http') || imagePath.startsWith('data:image')) {
    return imagePath;
  }
  
  // If it's a full path, extract just the filename
  const filename = imagePath.split('\\').pop().split('/').pop();
  
  // Return the URL with just the filename
  return `http://localhost:5000/uploads/${filename}`;
};

export const productApi = {
  getAllProducts: async () => {
    try {
      checkAdminAccess();
      const response = await axiosInstance.get('/admin/product/all');
      
      // Transform the image URLs in the response
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
      if (error.message === 'Unauthorized access. Please login as admin.') {
        throw { message: error.message };
      }
      throw error.response?.data || { message: 'Failed to fetch products' };
    }
  },

  getProductById: async (id) => {
    try {
      checkAdminAccess();
      const response = await axiosInstance.get(`/admin/product?id=${id}`);
      return response.data;
    } catch (error) {
      if (error.message === 'Unauthorized access. Please login as admin.') {
        throw { message: error.message };
      }
      throw error.response?.data || { message: 'Failed to fetch product' };
    }
  },

  createProduct: async (productData) => {
    try {
      checkAdminAccess();
      const formData = new FormData();
      
      // Basic product data
      formData.append('pName', productData.pName);
      formData.append('pShortDescription', productData.pShortDescription);
      formData.append('pDescription', productData.pDescription);
      formData.append('pCategory', productData.pCategory);
      formData.append('pPrice', String(productData.pPrice));
      formData.append('pPreviousPrice', String(productData.pPreviousPrice || 0));
      formData.append('pQuantity', productData.pQuantity);
      formData.append('pStock', String(productData.pStock));
      formData.append('pOffer', productData.pOffer || '0');
      formData.append('pTax', String(productData.pTax || 0));
      formData.append('pStatus', productData.pStatus || 'active');
      formData.append('pBrand', productData.pBrand || '');
      formData.append('pSubCategory', productData.pSubCategory || ''); // Always send subcategory
      formData.append('pNestedSubCategory', productData.pNestedSubCategory || '');

      // Handle image upload
      if (Array.isArray(productData.images)) {
        const validImages = productData.images.filter(image => image);
        
        if (validImages.length === 0) {
          throw new Error('Please upload at least one image.');
        }
  
        validImages.forEach((image) => {
          if (typeof image === 'string' && image.startsWith('data:image')) {
            const imageFile = dataURLtoFile(image, `product-image-${Date.now()}.jpg`);
            formData.append('pImage', imageFile);
          } else if (image instanceof File) {
            formData.append('pImage', image);
          }
        });
      }
  
      const response = await axiosInstance.post('/admin/product/new', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error in createProduct:', error);
      if (error.message === 'Unauthorized access. Please login as admin.') {
        throw { message: error.message };
      }
      throw error.response?.data || { message: error.message || 'Failed to create product' };
    }
  },

  updateProduct: async (id, productData) => {
    try {
      checkAdminAccess();
      const formData = new FormData();
      
      // Log the incoming data
      console.log('Incoming product data:', productData);

      // Validate required fields
      const requiredFields = ['pName', 'pBrand', 'pCategory'];
      const missingFields = requiredFields.filter(field => !productData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Basic product data
      formData.append('pName', productData.pName);
      formData.append('pShortDescription', productData.pShortDescription);
      formData.append('pDescription', productData.pDescription);
      formData.append('pCategory', productData.pCategory);
      formData.append('pPrice', String(productData.pPrice));
      formData.append('pPreviousPrice', String(productData.pPreviousPrice || 0));
      formData.append('pQuantity', productData.pQuantity);
      formData.append('pStock', String(productData.pStock));
      formData.append('pOffer', productData.pOffer || '0');
      formData.append('pTax', String(productData.pTax || 0));
      formData.append('pStatus', productData.pStatus);
      formData.append('pBrand', productData.pBrand);
      formData.append('pSubCategory', productData.pSubCategory || ''); // Ensure empty string if undefined
      formData.append('pNestedSubCategory', productData.pNestedSubCategory || '');

      // Log formData contents
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }
  
      // Handle image updates
      if (Array.isArray(productData.images)) {
        if (productData.imagesToDelete?.length > 0) {
          formData.append('imagesToDelete', JSON.stringify(productData.imagesToDelete));
        }

        productData.images.forEach((image, index) => {
          if (typeof image === 'string' && image.startsWith('data:image')) {
            const imageFile = dataURLtoFile(image, `product-image-${Date.now()}-${index}.jpg`);
            formData.append('pImage', imageFile);
          }
        });
      }
  
      const response = await axiosInstance.put(`/admin/product?id=${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error in updateProduct:', error);
      if (error.message === 'Unauthorized access. Please login as admin.') {
        throw { message: error.message };
      }
      throw error.response?.data || { message: error.message || 'Failed to update product' };
    }
  },

  deleteProduct: async (id) => {
    try {
      checkAdminAccess();
      const response = await axiosInstance.delete(`/admin/product?id=${id}`);
      return response.data;
    } catch (error) {
      if (error.message === 'Unauthorized access. Please login as admin.') {
        throw { message: error.message };
      }
      throw error.response?.data || { message: 'Failed to delete product' };
    }
  },

  updateStock: async (id, quantity) => {
    try {
      checkAdminAccess();
      const response = await axiosInstance.patch(`/admin/product/${id}/stock`, {
        pStock: quantity,
        pQuantity: quantity
      });
      return response.data;
    } catch (error) {
      if (error.message === 'Unauthorized access. Please login as admin.') {
        throw { message: error.message };
      }
      throw error.response?.data || { message: 'Failed to update stock' };
    }
  }
};

export default productApi;
