import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Chip,
  InputAdornment,
  TablePagination,
  Tooltip,
  CircularProgress,
  Grid,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';
import InventoryIcon from '@mui/icons-material/Inventory';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SearchIcon from '@mui/icons-material/Search';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import InfoIcon from '@mui/icons-material/Info';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import WarningIcon from '@mui/icons-material/Warning';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CloseIcon from '@mui/icons-material/Close';
import * as XLSX from 'xlsx';
import { useSnackbar } from 'notistack';
import '../styles/Products.css';
import { productApi } from '../api/productApi';
import { categoryApi } from '../api/categoryApi';
import { useLocation } from 'react-router-dom';

const Products = () => {
  const fileInputRef1 = useRef(null);
  const fileInputRef2 = useRef(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);

  const { enqueueSnackbar } = useSnackbar();

  const location = useLocation();
  const selectedCategory = location.state?.selectedCategory;
  
  // Add state for category filter
  const [categoryFilter, setCategoryFilter] = useState(selectedCategory || '');

  // Update useEffect to handle initial category filter
  useEffect(() => {
    if (location.state?.fromCategories && selectedCategory) {
      setCategoryFilter(selectedCategory);
    }
  }, [location.state, selectedCategory]);

  const fetchProducts = async () => {
    try {
      const response = await productApi.getAllProducts();
      if (response.success) {
        setProducts(response.products);
      } else {
        enqueueSnackbar(response.message || 'Failed to fetch products', { 
          variant: 'error' 
        });
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      enqueueSnackbar(error.message || 'Failed to fetch products', { 
        variant: 'error' 
      });
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoryApi.getAllCategories();
      if (response) {
        setCategories(response);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      enqueueSnackbar(error.message || 'Failed to fetch categories', { 
        variant: 'error' 
      });
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [open, setOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [imagePreviews, setImagePreviews] = useState([]);
  const imageInputRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];
  const [formData, setFormData] = useState({
    name: '',
    shortDescription: '',
    description: '',
    category: '',
    price: '',
    previousPrice: '',
    quantity: '',
    stock: '',
    offer: '0',
    tax: '5',
    status: 'active',
    brand: '',
    images: [],
    imagesToDelete: [],
    pSubCategory: '',
    pNestedSubCategory: '',
  });

  const [errors, setErrors] = useState({});

  const [categoryDialog, setCategoryDialog] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    image: '',
    status: 'active'
  });
  const categoryImageRef = useRef(null);
  const [categoryPreviewImage, setCategoryPreviewImage] = useState('');
  const [categoryErrors, setCategoryErrors] = useState({});

  const [searchQuery, setSearchQuery] = useState('');

  const [imagePreviewDialog, setImagePreviewDialog] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [stockDialogOpen, setStockDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [stockToAdd, setStockToAdd] = useState('');
  const [stockError, setStockError] = useState('');

  // Add state for subcategories
  const [subcategories, setSubcategories] = useState([]);

  // Add state for nested subcategories
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [nestedSubCategories, setNestedSubCategories] = useState([]);

  // Add function to fetch subcategories
  const fetchSubcategories = async (categoryName) => {
    try {
      // First get the category ID using the name
      const category = categories.find(cat => cat.cName === categoryName);
      if (!category) {
        setSubcategories([]);
        return;
      }
      
      const response = await categoryApi.getSubCategories(category._id);
      if (response.success) {
        setSubcategories(response.subCategories || []);
      }
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      setSubcategories([]);
    }
  };

  // Add function to fetch nested subcategories
  const fetchNestedSubCategories = async (categoryId, subCategoryId) => {
    try {
      const response = await categoryApi.getNestedSubCategories(categoryId, subCategoryId);
      if (response.success) {
        setNestedSubCategories(response.subCategories || []);
      } else {
        setNestedSubCategories([]);
      }
    } catch (error) {
      console.error('Error fetching nested subcategories:', error);
      enqueueSnackbar(error.message || 'Failed to fetch nested subcategories', { 
        variant: 'error' 
      });
      setNestedSubCategories([]);
    }
  };

  // Update the filtered products logic to include nested subcategory
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = (
        (product.pName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (product.pShortDescription?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (product.pDescription?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (product.pCategory?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (product.pSubCategory?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (product.pNestedSubCategory?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (product.pBrand?.toLowerCase() || '').includes(searchQuery.toLowerCase())
      );

      const matchesCategory = !categoryFilter || product.pCategory === categoryFilter;

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  useEffect(() => {
    if (formData.pCategory && !categories.some(cat => cat.name === formData.pCategory)) {
      setFormData(prev => ({
        ...prev,
        pCategory: ''
      }));
    }
  }, [categories, formData.pCategory]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpen = (product = null) => {
    if (product) {
      setEditProduct(product);
      setFormData({
        name: product.pName || '',
        shortDescription: product.pShortDescription || '',
        description: product.pDescription || '',
        category: product.pCategory || '',
        price: product.pPrice?.toString() || '',
        previousPrice: product.pPreviousPrice?.toString() || '',
        quantity: product.pQuantity?.toString() || '',
        stock: product.pStock?.toString() || '',
        offer: product.pOffer || '0',
        tax: product.pTax || 5,
        status: product.pStatus || 'active',
        brand: product.pBrand || '',
        images: product.pImage || [],
        imagesToDelete: [],
        pSubCategory: product.pSubCategory || '',
        pNestedSubCategory: product.pNestedSubCategory || '',
      });
      setImagePreviews(product.pImage || []);
      
      // Fetch subcategories and nested subcategories if they exist
      if (product.pCategory) {
        fetchSubcategories(product.pCategory);
        
        if (product.pSubCategory) {
          const category = categories.find(cat => cat.cName === product.pCategory);
          const subcategory = category?.subCategories?.find(sub => sub.name === product.pSubCategory);
          if (category && subcategory) {
            fetchNestedSubCategories(category._id, subcategory._id);
          }
        }
      }
    } else {
      setEditProduct(null);
      setFormData({
        name: '',
        shortDescription: '',
        description: '',
        category: '',
        price: '',
        previousPrice: '',
        quantity: '',
        stock: '',
        offer: '0',
        tax: '5',
        status: 'active',
        brand: '',
        images: [],
        imagesToDelete: [],
        pSubCategory: '',
        pNestedSubCategory: '',
      });
      setImagePreviews([]);
      setSubcategories([]);
      setNestedSubCategories([]);
    }
    setErrors({});
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditProduct(null);
    setFormData({
      name: '',
      shortDescription: '',
      description: '',
      category: '',
      price: '',
      previousPrice: '',
      quantity: '',
      stock: '',
      offer: '0',
      tax: '5',
      status: 'active',
      brand: '',
      images: [],
      imagesToDelete: [],
      pSubCategory: '',
      pNestedSubCategory: '',
    });
    setImagePreviews([]);
    setSubcategories([]);
    setNestedSubCategories([]);
    setErrors({});
  };

  const handleImageUpload = async (e, index) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10000000) { // 10MB limit
        setErrors(prev => ({
          ...prev,
          images: 'Image size should be less than 10MB'
        }));
        return;
      }

      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const compressedImage = await compressImage(reader.result);
          
          // Store the old image filename if it exists
          const oldImage = formData.images[index];
          const isOldImageFromServer = oldImage && 
            (typeof oldImage === 'string' && !oldImage.startsWith('data:'));
          
          // Update image previews
          setImagePreviews(prev => {
            const newPreviews = [...prev];
            newPreviews[index] = compressedImage;
            return newPreviews;
          });
          
          // Update form data images and track deleted images
          setFormData(prev => {
            const newImages = [...prev.images];
            newImages[index] = compressedImage;
            
            // Track the old image for deletion if it exists
            const imagesToDelete = [...(prev.imagesToDelete || [])];
            if (isOldImageFromServer) {
              const filename = oldImage.startsWith('http') ? 
                oldImage.split('/').pop() : oldImage;
              if (!imagesToDelete.includes(filename)) {
                imagesToDelete.push(filename);
              }
            }
            
            return {
              ...prev,
              images: newImages,
              imagesToDelete
            };
          });
          
          setErrors(prev => ({ ...prev, images: undefined }));
        } catch (error) {
          console.error('Error compressing image:', error);
          setErrors(prev => ({
            ...prev,
            images: 'Error processing image. Please try again.'
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (index) => {
    const imageToRemove = formData.images[index];
    
    // If it's an existing image from server, add to imagesToDelete
    if (imageToRemove && !imageToRemove.startsWith('data:image')) {
      const filename = imageToRemove.startsWith('http') ? 
        imageToRemove.split('/').pop() : imageToRemove;
      
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index),
        imagesToDelete: [...prev.imagesToDelete, filename]
      }));
    } else {
      // If it's a new image (base64), just remove it
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }));
    }
    
    // Update image previews
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
  
    try {
      setLoading(true);
      const productData = new FormData();

      // Add all the basic fields
      productData.append('pName', formData.name);
      productData.append('pShortDescription', formData.shortDescription);
      productData.append('pDescription', formData.description);
      productData.append('pCategory', formData.category);
      productData.append('pSubCategory', formData.pSubCategory);
      
      // Make sure to append the nested subcategory ID if it exists
      if (formData.pNestedSubCategory) {
        console.log('Adding nested subcategory:', formData.pNestedSubCategory);
        productData.append('pNestedSubCategory', formData.pNestedSubCategory);
      }

      productData.append('pPrice', formData.price);
      productData.append('pPreviousPrice', formData.previousPrice || 0);
      productData.append('pQuantity', formData.quantity);
      productData.append('pStock', formData.stock);
      productData.append('pOffer', formData.offer || '0');
      productData.append('pTax', formData.tax || '5');
      productData.append('pStatus', formData.status || 'active');
      productData.append('pBrand', formData.brand);

      // Add images
      formData.images.forEach((image, index) => {
        if (image && image instanceof File) {
          productData.append('pImage', image);
        }
      });

      console.log('Submitting product with data:', {
        ...Object.fromEntries(productData.entries()),
        nestedSubCategory: formData.pNestedSubCategory
      });

      const response = editProduct
        ? await productApi.updateProduct(editProduct._id, productData)
        : await productApi.createProduct(productData);

      if (response.success) {
        enqueueSnackbar(
          editProduct ? 'Product updated successfully' : 'Product added successfully',
          { variant: 'success' }
        );
        handleClose();
        fetchProducts();
      }
    } catch (error) {
      console.error('Error submitting product:', error);
      enqueueSnackbar(error.message || 'Failed to submit product', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.shortDescription.trim()) newErrors.shortDescription = 'Short description is required';
    if (!formData.description.trim()) newErrors.description = 'Full description is required';
    if (!formData.category) newErrors.category = 'Category is required';
    
    // Price validation
    const price = parseFloat(formData.price);
    if (!formData.price || isNaN(price) || price <= 0) {
      newErrors.price = 'Valid price is required (must be greater than 0)';
    }
    
    // Previous price validation (optional)
    if (formData.previousPrice) {
      if (isNaN(formData.previousPrice) || parseFloat(formData.previousPrice) < 0) {
        newErrors.previousPrice = 'Previous price must be a positive number';
      }
    }
    
    // Quantity validation
    if (!formData.quantity || isNaN(formData.quantity) || parseInt(formData.quantity) < 0) {
      newErrors.quantity = 'Valid quantity is required';
    }
    
    // Image validation - minimum 3 images required
    if (!formData.images || formData.images.filter(img => img).length < 3) {
      newErrors.images = 'Minimum 3 images are required';
    }

    // Offer and tax validation (optional fields but must be valid if provided)
    if (formData.offer && (isNaN(formData.offer) || parseFloat(formData.offer) < 0 || parseFloat(formData.offer) > 100)) {
      newErrors.offer = 'Offer must be between 0 and 100';
    }
    if (formData.tax && (isNaN(formData.tax) || parseFloat(formData.tax) < 0 || parseFloat(formData.tax) > 100)) {
      newErrors.tax = 'Tax must be between 0 and 100';
    }

    // Stock validation
    const stock = parseInt(formData.stock);
    if (!formData.stock || isNaN(stock) || stock < 0) {
      newErrors.stock = 'Valid stock is required (must be 0 or greater)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDelete = async (id) => {
    try {
      const response = await productApi.deleteProduct(id);
      if (response.success) {
        enqueueSnackbar('Product deleted successfully', { variant: 'success' });
        fetchProducts();
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      enqueueSnackbar(error.message || 'Failed to delete product', { 
        variant: 'error' 
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'error';
      case 'out_of_stock':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getFinalPrice = (price, offer, tax) => {
    const discountedPrice = price - (price * (offer / 100));
    const finalPrice = discountedPrice + (discountedPrice * (tax / 100));
    return finalPrice.toFixed(2);
  };

  const compressImage = (base64String) => {
    // If it's not a base64 image, return as is
    if (!base64String?.startsWith('data:image')) {
      return base64String;
    }

    // Create temporary image for compression
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64String;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        
        let width = img.width;
        let height = img.height;
        
        // Calculate new dimensions
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Compress to JPEG with 0.7 quality
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'category') {
      if (value === 'add_new_category') {
        setCategoryDialog(true);
        return;
      }
      setFormData(prev => ({
        ...prev,
        category: value,
        pSubCategory: '', // Reset subcategory when category changes
        pNestedSubCategory: '', // Reset nested subcategory
      }));
      if (value) {
        fetchSubcategories(value);
      } else {
        setSubcategories([]);
        setNestedSubCategories([]); // Clear nested subcategories
      }
      return;
    }

    // Handle subcategory selection
    if (name === 'pSubCategory') {
      setFormData(prev => ({
        ...prev,
        pSubCategory: value,
        pNestedSubCategory: '', // Reset nested subcategory when subcategory changes
      }));
      
      if (value) {
        const category = categories.find(cat => cat.cName === formData.category);
        if (category) {
          fetchNestedSubCategories(category._id, value);
        }
      } else {
        setNestedSubCategories([]);
      }
      return;
    }

    // Handle nested subcategory selection
    if (name === 'pNestedSubCategory') {
      setFormData(prev => ({
        ...prev,
        pNestedSubCategory: value
      }));
      return;
    }

    // Handle numeric fields
    if (['price', 'previousPrice', 'stock', 'offer', 'tax'].includes(name)) {
      const numValue = value === '' ? '' : Number(value);
      if (!isNaN(numValue)) {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      }
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCategoryImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5000000) {
        setCategoryErrors(prev => ({
          ...prev,
          image: 'Image size should be less than 5MB'
        }));
        return;
      }

      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const compressedImage = await compressImage(reader.result);
          setCategoryPreviewImage(compressedImage);
          setNewCategory(prev => ({
            ...prev,
            image: compressedImage
          }));
          setCategoryErrors(prev => ({ ...prev, image: undefined }));
        } catch (error) {
          console.error('Error processing category image:', error);
          setCategoryErrors(prev => ({
            ...prev,
            image: 'Error processing image. Please try again.'
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const validateCategoryForm = () => {
    const errors = {};
    if (!newCategory.name.trim()) errors.name = 'Name is required';
    if (!newCategory.description.trim()) errors.description = 'Description is required';
    if (!newCategory.image) errors.image = 'Image is required';
    setCategoryErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddNewCategory = async () => {
    if (!validateCategoryForm()) return;
    
    try {
      setLoading(true);
      
      if (formData.category && formData.pSubCategory) {
        // Creating a nested subcategory
        const parentCategory = categories.find(cat => cat.cName === formData.category);
        if (!parentCategory) {
          throw new Error('Parent category not found');
        }

        const subcategory = parentCategory.subCategories.find(sub => sub.name === formData.pSubCategory);
        if (!subcategory) {
          throw new Error('Parent subcategory not found');
        }

        const response = await categoryApi.createNestedSubCategory(
          parentCategory._id,
          subcategory._id,
          {
            name: newCategory.name,
            description: newCategory.description,
            status: newCategory.status,
            image: newCategory.image
          }
        );
        
        if (response.success) {
          enqueueSnackbar('Nested subcategory added successfully', { variant: 'success' });
          await fetchNestedSubCategories(parentCategory._id, subcategory._id);
        }
      } else if (formData.category) {
        // Creating a subcategory
        const parentCategory = categories.find(cat => cat.cName === formData.category);
        if (!parentCategory) {
          throw new Error('Parent category not found');
        }

        const response = await categoryApi.createSubCategory(parentCategory._id, {
          name: newCategory.name,
          description: newCategory.description,
          status: newCategory.status,
          image: newCategory.image
        });
        
        if (response.success) {
          enqueueSnackbar('Subcategory added successfully', { variant: 'success' });
          await fetchSubcategories(formData.category);
        }
      } else {
        // Creating a main category
        const response = await categoryApi.createCategory(newCategory);
        
        if (response.success) {
          enqueueSnackbar('Category added successfully', { variant: 'success' });
          await fetchCategories();
          setFormData(prev => ({
            ...prev,
            category: newCategory.name
          }));
        }
      }

      // Reset form
      setCategoryDialog(false);
      setNewCategory({
        name: '',
        description: '',
        image: '',
        status: 'active'
      });
      setCategoryPreviewImage('');
      setCategoryErrors({});
    } catch (error) {
      console.error('Error adding category:', error);
      enqueueSnackbar(error.message || 'Failed to add category', { 
        variant: 'error' 
      });
      setCategoryErrors(prev => ({
        ...prev,
        submit: 'Failed to add category. Please try again.'
      }));
    } finally {
      setLoading(false);
    }
  };

  // Add CSS for proper image display
  const styles = {
    productImage: {
      width: '60px',
      height: '60px',
      objectFit: 'cover',
      borderRadius: '4px',
      border: '1px solid #eee'
    },
    productImages: {
      display: 'flex',
      gap: '8px',
      alignItems: 'center'
    }
  };

  const handleImageClick = (images) => {
    setSelectedImages(images);
    setCurrentImageIndex(0);
    setImagePreviewDialog(true);
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % selectedImages.length);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + selectedImages.length) % selectedImages.length);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setPage(0);
  };

  // Add function to calculate total stock
  const calculateTotalStock = () => {
    return products.reduce((total, product) => total + (parseInt(product.pQuantity) || 0), 0);
  };

  // Add function to count low stock items
  const getLowStockCount = () => {
    return products.filter(product => product.pQuantity <= 10).length;
  };

  // Add function to handle stock update
  const handleAddStock = (product) => {
    setSelectedProduct(product);
    setStockToAdd('');
    setStockError('');
    setStockDialogOpen(true);
  };

  // Add function to save new stock
  const handleStockSubmit = () => {
    if (!stockToAdd || isNaN(stockToAdd) || parseInt(stockToAdd) <= 0) {
      setStockError('Please enter a valid positive number');
      return;
    }

    setProducts(prevProducts => 
      prevProducts.map(p => {
        if (p.id === selectedProduct.id) {
          const stockToAddNum = parseInt(stockToAdd);
          const newQuantity = parseInt(p.pQuantity || 0) + stockToAddNum;
          const currentOverallStock = parseInt(p.pStock || p.pQuantity || 0);
          return {
            ...p,
            pQuantity: newQuantity,
            pStock: currentOverallStock + stockToAddNum // Overall stock only increases
          };
        }
        return p;
      })
    );

    enqueueSnackbar('Stock updated successfully', { variant: 'success' });
    setStockDialogOpen(false);
    setSelectedProduct(null);
    setStockToAdd('');
  };

  const handleExportToExcel = () => {
    // Prepare the data for export
    const exportData = products.map(product => ({
      'ID': product._id,
      'Product Name': product.pName,
      'Short Description': product.pShortDescription,
      'Description': product.pDescription,
      'Category': product.pCategory,
      'Subcategory': product.pSubCategory || '-',
      'Nested Subcategory': product.pNestedSubCategory || '-',
      'Brand': product.pBrand,
      'Price': product.pPrice,
      'Previous Price': product.pPreviousPrice || '',
      'Stock': product.pStock,
      'Quantity': product.pQuantity,
      'Offer': product.pOffer + '%',
      'Tax': product.pTax + '%',
      'Status': product.pStatus,
      'Created At': new Date(product.createdAt).toLocaleDateString()
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Products');
    
    // Generate Excel file and trigger download
    XLSX.writeFile(wb, `products_list_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`);
  };

  // Add a clear filter function
  const handleClearFilter = () => {
    setCategoryFilter('');
    setSearchQuery('');
  };

  const handleProductSubmit = async (formData) => {
    try {
      // Make sure the nested subcategory ID is included in the form data
      const productData = new FormData();
      // ... other form fields ...
      if (formData.nestedSubCategory) {
        productData.append('pNestedSubCategory', formData.nestedSubCategory._id);
      }
      // ... submit product ...
    } catch (error) {
      console.error('Error creating product:', error);
    }
  };

  return (
    <Box className="products-container">
      {/* Add category filter indicator */}
      {categoryFilter && (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2, 
          mb: 2,
          p: 2,
          bgcolor: 'primary.light',
          borderRadius: 1
        }}>
          <Typography>
            Showing products in category: <strong>{categoryFilter}</strong>
          </Typography>
          <Button 
            size="small" 
            variant="contained"
            onClick={handleClearFilter}
          >
            Clear Filter
          </Button>
        </Box>
      )}

      <Box className="products-header">
        <Typography className="products-title" variant="h4">Products</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={handleExportToExcel}
            startIcon={<FileDownloadIcon />}
          >
            Export to Excel
          </Button>
          <Button
            className="add-product-btn"
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
          >
            Add Product
          </Button>
        </Box>
      </Box>

      <Box className="search-container">
        <TextField
          className="search-field"
          fullWidth
          placeholder="Search products by name, description or category..."
          value={searchQuery}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Paper className="table-container">
        <TableContainer>
          <Table>
            <TableHead className="table-header">
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell>Images</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Subcategory</TableCell>
                <TableCell>Nested Subcategory</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Stock</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No products found
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((product) => (
                    <TableRow key={product._id} className="product-row">
                      <TableCell className="product-cell">
                        <Box className="product-info">
                          <Box className="product-details">
                            <Typography className="product-name">
                              {product.pName}
                            </Typography>
                            <Typography className="product-short-description">
                              {product.pShortDescription}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell className="product-cell">
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {(product.pImage || []).slice(0, 3).map((image, index) => (
                            <img
                              key={index}
                              src={image}
                              alt={`${product.pName} - ${index + 1}`}
                              style={{
                                width: 50,
                                height: 50,
                                objectFit: 'cover',
                                borderRadius: 4
                              }}
                              onClick={() => handleImageClick(product.pImage)}
                              onError={(e) => {
                                console.error('Error loading image:', image);
                                e.target.src = 'https://via.placeholder.com/50?text=No+Image';
                                // Optionally, try to fix the URL if it's a path issue
                                if (image.includes('\\')) {
                                  const filename = image.split('\\').pop().split('/').pop();
                                  e.target.src = `http://localhost:5000/uploads/${filename}`;
                                }
                              }}
                            />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell className="product-cell">
                        <Chip 
                          label={product.pCategory} 
                          size="small"
                        />
                      </TableCell>
                      <TableCell className="product-cell">
                        <Typography>{product.pSubCategory || '-'}</Typography>
                      </TableCell>
                      <TableCell className="product-cell">
                        <Typography>{product.pNestedSubCategory || '-'}</Typography>
                      </TableCell>
                      <TableCell className="product-cell">
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                            ₹{product.pPrice.toLocaleString()}
                          </Typography>
                          {product.pPreviousPrice > 0 && (
                            <Typography 
                              variant="body2" 
                              color="text.secondary"
                              sx={{ 
                                textDecoration: 'line-through',
                                display: 'block',
                                mb: 0.5
                              }}
                            >
                              ₹{product.pPreviousPrice.toLocaleString()}
                            </Typography>
                          )}
                          {product.pOffer > 0 && (
                            <Chip
                              label={`${product.pOffer}% OFF`}
                              color="error"
                              size="small"
                              sx={{ mt: 0.5 }}
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell className="product-cell">
                        <Box>
                          <Typography variant="body2">
                            Stock: {product.pStock}
                          </Typography>
                          {product.pStock <= 10 && (
                            <Chip 
                              label="Low Stock" 
                              color="warning" 
                              size="small" 
                              sx={{ mt: 0.5 }}
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell className="product-cell">
                        <Chip
                          label={product.pStatus}
                          color={getStatusColor(product.pStatus)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell className="product-cell">
                        <Box className="action-buttons">
                          <IconButton
                            onClick={() => handleOpen(product)}
                            color="primary"
                            size="small"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            onClick={() => handleDelete(product._id)}
                            color="error"
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          className="pagination-container"
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredProducts.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle className="dialog-title">
            {editProduct ? 'Edit Product' : 'Add Product'}
          </DialogTitle>
          <DialogContent className="dialog-content">
            <Box className="form-grid">
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Product Images
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {[0, 1, 2, 3, 4].map((index) => (
                  <Box
                    key={index}
                    sx={{
                        position: 'relative',
                        width: 150,
                        height: 150,
                        border: '2px dashed #ccc',
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        overflow: 'hidden',
                        '&:hover .delete-icon': {
                          opacity: 1
                        }
                      }}
                    >
                      {imagePreviews[index] ? (
                        <>
                          <img
                            src={imagePreviews[index].startsWith('http') ? 
                              imagePreviews[index] : 
                              imagePreviews[index]
                            }
                            alt={`Product ${index + 1}`}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                          <IconButton
                            className="delete-icon"
                            sx={{
                              position: 'absolute',
                              top: 5,
                              right: 5,
                              backgroundColor: 'rgba(0, 0, 0, 0.5)',
                              color: 'white',
                              opacity: 0,
                              transition: 'opacity 0.2s',
                              '&:hover': {
                                backgroundColor: 'rgba(0, 0, 0, 0.7)'
                              }
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveImage(index);
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </>
                      ) : (
                        <Box
                          onClick={() => imageInputRefs[index].current.click()}
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 1
                          }}
                        >
                          <AddCircleOutlineIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            Add Image
                          </Typography>
                        </Box>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        ref={imageInputRefs[index]}
                        style={{ display: 'none' }}
                        onChange={(e) => handleImageUpload(e, index)}
                      />
                  </Box>
                ))}
                </Box>
                {errors.images && (
                  <Typography color="error" variant="caption" sx={{ mt: 1 }}>
                    {errors.images}
                  </Typography>
                )}
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={12}>
                  <TextField
                    className="form-field"
                    fullWidth
                    label="Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    error={!!errors.name}
                    helperText={errors.name}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    className="form-field"
                    fullWidth
                    label="Price"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    error={!!errors.price}
                    helperText={errors.price}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          ₹
                        </InputAdornment>
                      ),
                      inputProps: { 
                        min: "0.01",
                        step: "0.01"
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    className="form-field"
                    fullWidth
                    label="Previous Price"
                    name="previousPrice"
                    type="number"
                    value={formData.previousPrice}
                    onChange={handleChange}
                    error={!!errors.previousPrice}
                    helperText={errors.previousPrice}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          ₹
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>

              <TextField
                className="form-field"
                fullWidth
                label="Short Description"
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleChange}
                required
                error={!!errors.shortDescription}
                helperText={errors.shortDescription || 'Brief summary (max 100 characters)'}
                inputProps={{ maxLength: 100 }}
              />

              <TextField
                className="form-field"
                fullWidth
                label="Full Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={4}
                required
                error={!!errors.description}
                helperText={errors.description || 'Detailed product description'}
              />

              <TextField
                className="form-field"
                fullWidth
                label="Brand"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                required
                error={!!errors.brand}
                helperText={errors.brand}
                inputProps={{ maxLength: 30 }}
              />

              <FormControl className="form-field" fullWidth required error={!!errors.category}>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={formData.category || ''}
                  onChange={handleChange}
                  label="Category"
                >
                  {categories.length === 0 ? (
                    <MenuItem value="" disabled>No categories available</MenuItem>
                  ) : (
                    categories
                      .filter(category => category.cStatus === 'active')
                      .map((category) => (
                        <MenuItem key={category._id} value={category.cName}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {category.cImage && (
                              <Avatar
                                src={`http://localhost:5000/uploads/category/${category.cImage}`}
                                alt={category.cName}
                                sx={{ width: 24, height: 24 }}
                              />
                            )}
                            <Typography>{category.cName}</Typography>
                          </Box>
                        </MenuItem>
                      ))
                  )}
                  <MenuItem 
                    value="add_new_category"
                    sx={{ 
                      borderTop: '1px solid',
                      borderColor: 'divider',
                      color: 'primary.main',
                    }}
                  >
                    <AddCircleOutlineIcon sx={{ mr: 1 }} />
                    Add New Category
                  </MenuItem>
                </Select>
                {errors.category && (
                  <Typography className="error-text">
                    {errors.category}
                  </Typography>
                )}
              </FormControl>

              <FormControl fullWidth margin="normal">
                <InputLabel>Subcategory</InputLabel>
                <Select
                  value={formData.pSubCategory || ''}
                  name="pSubCategory"
                  label="Subcategory"
                  onChange={(e) => {
                    const value = e.target.value.trim();
                    setFormData(prev => ({
                      ...prev,
                      pSubCategory: value || '',
                      pNestedSubCategory: '' // Reset nested subcategory when subcategory changes
                    }));
                    
                    // Fetch nested subcategories when a subcategory is selected
                    if (value) {
                      const category = categories.find(cat => cat.cName === formData.category);
                      const subcategory = category?.subCategories?.find(sub => sub.name === value);
                      if (category && subcategory) {
                        fetchNestedSubCategories(category._id, subcategory._id);
                      }
                    } else {
                      setNestedSubCategories([]); // Clear nested subcategories if no subcategory selected
                    }
                  }}
                >
                  <MenuItem value="">None</MenuItem>
                  {subcategories.map((subcat) => (
                    <MenuItem key={subcat._id} value={subcat.name}>
                      {subcat.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth margin="normal">
                <InputLabel>Nested Subcategory</InputLabel>
                <Select
                  value={formData.pNestedSubCategory || ''}
                  name="pNestedSubCategory"
                  label="Nested Subcategory"
                  onChange={handleChange}
                  disabled={!formData.pSubCategory} // Disable if no subcategory is selected
                >
                  <MenuItem value="">None</MenuItem>
                  {nestedSubCategories.map((nestedSubcat) => (
                    <MenuItem key={nestedSubcat._id} value={nestedSubcat.name}>
                      {nestedSubcat.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                className="form-field"
                fullWidth
                label="stock"
                name="stock"
                type="number"
                value={formData.stock}
                onChange={handleChange}
                required
                error={!!errors.stock}
                helperText={errors.stock}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <InventoryIcon />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                className="form-field"
                fullWidth
                label="Offer (%)"
                name="offer"
                type="number"
                value={formData.offer}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocalOfferIcon />
                    </InputAdornment>
                  ),
                  inputProps: { min: 0, max: 100 }
                }}
              />

              <TextField
                className="form-field"
                fullWidth
                label="Tax (%)"
                name="tax"
                type="number"
                value={formData.tax}
                onChange={handleChange}
                required
                InputProps={{
                  inputProps: { min: 0, max: 100 }
                }}
              />

              <TextField
                className="form-field"
                fullWidth
                label="Weight (grams)"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleChange}
                required
                error={!!errors.quantity}
                helperText={errors.quantity}
                InputProps={{
                  endAdornment: <InputAdornment position="end">g</InputAdornment>,
                  inputProps: { min: 0 }
                }}
              />

              <FormControl className="form-field" fullWidth required>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  label="Status"
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="out_of_stock">Out of Stock</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions className="dialog-actions">
            <Button 
              className="dialog-button" 
              onClick={handleClose} 
              variant="outlined"
            >
              Cancel
            </Button>
            <Button 
              className="dialog-button"
              type="submit"
              variant="contained"
              disabled={categories.length === 0}
            >
              {editProduct ? 'Update Product' : 'Add Product'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Add Category Dialog */}
      <Dialog 
        open={categoryDialog} 
        onClose={() => {
          setCategoryDialog(false);
          setCategoryPreviewImage('');
          setNewCategory({
            name: '',
            description: '',
            image: '',
            status: 'active'
          });
          setCategoryErrors({});
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle className="dialog-title">Add New Category</DialogTitle>
        <DialogContent className="dialog-content">
          <Box className="form-grid">
            <Box
              className={`image-upload-container ${categoryErrors.image ? 'has-error' : ''}`}
              onClick={() => categoryImageRef.current.click()}
              sx={{
                backgroundImage: categoryPreviewImage ? `url(${categoryPreviewImage})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                cursor: 'pointer',
                height: 200,
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px dashed',
                borderColor: categoryErrors.image ? 'error.main' : 'divider',
                borderRadius: 1,
                '&:hover': {
                  borderColor: 'primary.main',
                  opacity: 0.8
                }
              }}
            >
              {!categoryPreviewImage && (
                <>
                  <CloudUploadIcon className="image-upload-icon" />
                  <Typography className="image-upload-text">
                    Click to upload image
                  </Typography>
                </>
              )}
              {categoryErrors.image && (
                <Typography className="error-text">
                  {categoryErrors.image}
                </Typography>
              )}
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog
        open={imagePreviewDialog}
        onClose={() => setImagePreviewDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            minHeight: '60vh'
          }
        }}
      >
        <DialogTitle 
          className="dialog-title"
          sx={{
            borderBottom: '1px solid',
            borderColor: 'divider',
            pb: 2
          }}
        >
          <Typography variant="h6" component="span">
            Product Images
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ ml: 1 }}
          >
            {`${currentImageIndex + 1} of ${selectedImages.length}`}
          </Typography>
        </DialogTitle>
        <DialogContent 
          className="dialog-content"
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            p: 4
          }}
        >
          <Box 
            className="image-preview-container"
            sx={{
              position: 'relative',
              marginTop: '10px',
              width: '100%',
              height: '300px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <IconButton
              sx={{
                position: 'absolute',
                left: 0,
                backgroundColor: 'rgba(0,0,0,0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.2)'
                }
              }}
              onClick={handlePrevImage}
            >
              <NavigateBeforeIcon />
            </IconButton>
            <img
              src={selectedImages[currentImageIndex]}
              alt="Product"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                borderRadius: 8
              }}
            />
            <IconButton
              sx={{
                position: 'absolute',
                right: 0,
                backgroundColor: 'rgba(0,0,0,0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.2)'
                }
              }}
              onClick={handleNextImage}
            >
              <NavigateNextIcon />
            </IconButton>
          </Box>
        </DialogContent>
        <DialogActions 
          className="dialog-actions"
          sx={{
            borderTop: '1px solid',
            borderColor: 'divider',
            p: 2,
            gap: 1
          }}
        >
          <Button
            variant="outlined"
            onClick={() => setImagePreviewDialog(false)}
            startIcon={<CloseIcon />}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={stockDialogOpen}
        onClose={() => setStockDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle className="dialog-title">Add Stock</DialogTitle>
        <DialogContent className="dialog-content">
          <Box className="form-grid">
            <TextField
              className="form-field"
              fullWidth
              label="Stock to Add"
              name="stockToAdd"
              type="number"
              value={stockToAdd}
              onChange={(e) => setStockToAdd(e.target.value)}
              required
              error={!!stockError}
              helperText={stockError}
            />
          </Box>
        </DialogContent>
        <DialogActions className="dialog-actions">
          <Button
            className="dialog-button"
            onClick={() => setStockDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button
            className="dialog-button"
            onClick={handleStockSubmit}
          >
            Add Stock
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Products;