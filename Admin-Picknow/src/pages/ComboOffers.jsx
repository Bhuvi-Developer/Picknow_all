import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  InputAdornment,
  Autocomplete,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import * as XLSX from 'xlsx';
import '../styles/ComboOffers.css';
import { comboApi } from '../api/comboApi';
import { productApi } from '../api/productApi';
import { useSnackbar } from 'notistack';

const compressImage = (base64String, maxWidth = 800) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64String;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      let width = img.width;
      let height = img.height;
      
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
  });
};

const safeSetLocalStorage = (key, value) => {
  try {
    const serializedValue = JSON.stringify(value);
    localStorage.setItem(key, serializedValue);
    return true;
  } catch (error) {
    console.error(`Error saving to localStorage: ${error.message}`);
    return false;
  }
};

const ComboOffers = () => {
  const fileInputRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [comboOffers, setComboOffers] = useState(() => {
    try {
      const savedCombos = localStorage.getItem('comboOffers');
      return savedCombos ? JSON.parse(savedCombos) : [];
    } catch (error) {
      console.error('Error loading combo offers:', error);
      return [];
    }
  });

  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [editCombo, setEditCombo] = useState(null);
  const [previewImage, setPreviewImage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discount: '',
    status: 'active',
    image: ''
  });
  const [errors, setErrors] = useState({});
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [comboToDelete, setComboToDelete] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch products
        const productsResponse = await productApi.getAllProducts();
        if (productsResponse.success) {
          setProducts(productsResponse.products);
        } else {
          enqueueSnackbar('Failed to fetch products', { variant: 'error' });
        }

        // Fetch combos
        await fetchCombos();
      } catch (error) {
        console.error('Error fetching data:', error);
        enqueueSnackbar(error.message || 'Failed to fetch data', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [enqueueSnackbar]);

  const handleOpen = (combo = null) => {
    if (combo) {
      setEditCombo(combo);
      setFormData({
        name: combo.ccName,
        description: combo.ccDescription,
        price: combo.ccPrice?.toString() || '',
        discount: combo.ccOffer?.toString() || '',
        status: combo.ccStatus,
        image: combo.ccImage?.[0] || ''
      });
      setPreviewImage(combo.ccImage?.[0] || '');
      setSelectedProducts(combo.ccProducts || []);
    } else {
      setEditCombo(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        discount: '',
        status: 'active',
        image: ''
      });
      setPreviewImage('');
      setSelectedProducts([]);
    }
    setErrors({});
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditCombo(null);
    setSelectedProducts([]);
    setPreviewImage('');
    setFormData({
      name: '',
      description: '',
      price: '',
      discount: '',
      status: 'active',
      image: ''
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else if (isNaN(formData.price) || parseFloat(formData.price) < 0) {
      newErrors.price = 'Price must be a positive number';
    }
    if (!formData.discount) {
      newErrors.discount = 'Discount is required';
    } else if (isNaN(formData.discount) || parseFloat(formData.discount) < 0 || parseFloat(formData.discount) > 100) {
      newErrors.discount = 'Discount must be between 0 and 100';
    }
    if (selectedProducts.length < 2) {
      newErrors.products = 'Select at least 2 products for combo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5000000) {
        setErrors(prev => ({
          ...prev,
          image: 'Image size should be less than 5MB'
        }));
        return;
      }

      try {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const compressedImage = await compressImage(reader.result);
          setPreviewImage(compressedImage);
          setFormData(prev => ({
            ...prev,
            image: compressedImage
          }));
          setErrors(prev => ({ ...prev, image: undefined }));
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Error processing image:', error);
        setErrors(prev => ({
          ...prev,
          image: 'Failed to process image. Please try again.'
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
  
    try {
      setLoading(true);
      const comboData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        offer: parseFloat(formData.discount || '0'),
        quantity: 1,
        status: formData.status,
        products: selectedProducts.map(p => ({ _id: p._id })),
        images: previewImage ? [previewImage] : []
      };
  
      if (editCombo) {
        const response = await comboApi.updateCombo(editCombo._id, comboData);
        if (response?.success) {
          await fetchCombos();
          handleClose();
          enqueueSnackbar('Combo updated successfully', { variant: 'success' });
        } else {
          throw new Error(response?.message || 'Failed to update combo');
        }
      } else {
        const response = await comboApi.createCombo(comboData);
        if (response?.success) {
          await fetchCombos();
          handleClose();
          enqueueSnackbar('Combo created successfully', { variant: 'success' });
        } else {
          throw new Error(response?.message || 'Failed to create combo');
        }
      }
    } catch (error) {
      console.error('Error saving combo:', error);
      enqueueSnackbar(error.message || 'Failed to save combo', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelect = (event, newValue) => {
    if (newValue) {
      if (!selectedProducts.find(p => p._id === newValue._id)) {
        setSelectedProducts([...selectedProducts, newValue]);
      }
    }
  };

  const handleRemoveProduct = (productId) => {
    setSelectedProducts(selectedProducts.filter(p => p._id !== productId));
  };

  const handleDeleteClick = (combo) => {
    setComboToDelete(combo);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (comboToDelete) {
      try {
        setLoading(true);
        const response = await comboApi.deleteCombo(comboToDelete._id);
        await fetchCombos();
        enqueueSnackbar(response.message || 'Combo deleted successfully', { variant: 'success' });
      } catch (error) {
        console.error('Error deleting combo:', error);
        enqueueSnackbar(error.message || 'Failed to delete combo', { variant: 'error' });
      } finally {
        setLoading(false);
        setDeleteConfirmOpen(false);
        setComboToDelete(null);
      }
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false);
    setComboToDelete(null);
  };

  const handleEditClick = (combo) => {
    handleOpen(combo);
  };

  const filteredComboOffers = comboOffers
    .filter(combo => 
      (combo.ccName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (combo.ccDescription?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const fetchCombos = async () => {
    try {
      const response = await comboApi.getAllCombos();
      if (response.success) {
        setComboOffers(response.combos);
      }
    } catch (error) {
      console.error('Error fetching combos:', error);
      enqueueSnackbar(error.message || 'Failed to fetch combos', { 
        variant: 'error' 
      });
    }
  };

  const handleExportToExcel = () => {
    // Prepare the data for export
    const exportData = comboOffers.map(combo => ({
      'ID': combo._id,
      'Combo Name': combo.ccName,
      'Description': combo.ccDescription,
      'Price': combo.ccPrice,
      'Offer': combo.ccOffer + '%',
      'Products': combo.ccProducts?.map(p => p.pName).join(', '),
      'Status': combo.ccStatus,
      'Created At': new Date(combo.createdAt).toLocaleDateString()
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Combo Offers');
    
    // Generate Excel file and trigger download
    XLSX.writeFile(wb, `combo_offers_list_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`);
  };

  return (
    <Box className="combo-offers-container">
      <Box className="combo-offers-header">
        <Typography variant="h4">Combo Offers</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={handleExportToExcel}
            startIcon={<FileDownloadIcon />}
          >
            Export to Excel
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
          >
            Create Combo Offer
          </Button>
        </Box>
      </Box>

      <Box className="search-container">
        <TextField
          fullWidth
          placeholder="Search combo offers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Combo Image</TableCell>
              <TableCell>Combo Name</TableCell>
              <TableCell>Products</TableCell>
              <TableCell>Total Price</TableCell>
              <TableCell>Discount</TableCell>
              <TableCell>Final Price</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredComboOffers.map((combo) => (
              <TableRow key={combo._id}>
                <TableCell>
                  <img 
                    src={combo.ccImage?.[0] ? `http://localhost:5000/uploads/${combo.ccImage[0]}` : 'https://via.placeholder.com/100'} 
                    alt={combo.ccName}
                    style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: '8px' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/100';
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle1">{combo.ccName}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {combo.ccDescription}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {combo.ccProducts?.map(product => (
                      <Chip
                        key={product._id}
                        label={`${product.pName}`}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </TableCell>
                <TableCell>₹{combo.ccPrice?.toFixed(2)}</TableCell>
                <TableCell>{combo.ccOffer}%</TableCell>
                <TableCell>₹{combo.ccPrice?.toFixed(2)}</TableCell>
                <TableCell>
                  <Chip
                    label={combo.ccStatus}
                    color={combo.ccStatus === 'active' ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEditClick(combo)} size="small">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteClick(combo)} size="small">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editCombo ? 'Edit Combo Offer' : 'Create Combo Offer'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box
                  className="image-upload-container"
                  onClick={() => fileInputRef.current.click()}
                  sx={{
                    height: 200,
                    border: '2px dashed #ccc',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    backgroundImage: previewImage ? (
                      previewImage.startsWith('data:') ? 
                        `url(${previewImage})` : 
                        `url(http://localhost:5000/uploads/${previewImage})`
                    ) : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  {!previewImage && (
                    <Box sx={{ textAlign: 'center' }}>
                      <CloudUploadIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
                      <Typography color="text.secondary">
                        Click to upload combo image
                      </Typography>
                    </Box>
                  )}
                </Box>
                {errors.image && (
                  <Typography color="error" variant="caption">
                    {errors.image}
                  </Typography>
                )}
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Combo Name"
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  error={!!errors.name}
                  helperText={errors.name}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  multiline
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  error={!!errors.description}
                  helperText={errors.description}
                />
              </Grid>

              <Grid item xs={12}>
                <Autocomplete
                  options={products}
                  getOptionLabel={(option) => `${option.pName} - ₹${option.pPrice}`}
                  onChange={handleProductSelect}
                  value={null}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Search and select products"
                      variant="outlined"
                      error={!!errors.products}
                      helperText={errors.products}
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <img 
                          src={option.pImage?.[0] || 'https://via.placeholder.com/50'}
                          alt={option.pName}
                          style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: '4px' }}
                        />
                        <Box>
                          <Typography variant="subtitle2">{option.pName}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            ₹{option.pPrice}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {selectedProducts.map(product => (
                    <Chip
                      key={product._id}
                      label={`${product.pName} - ₹${product.pPrice}`}
                      onDelete={() => handleRemoveProduct(product._id)}
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Grid>

              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Price (₹)"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  error={!!errors.price}
                  helperText={errors.price}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Discount (%)"
                  name="discount"
                  type="number"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                  error={!!errors.discount}
                  helperText={errors.discount}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }}
                />
              </Grid>

              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    label="Status"
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            {editCombo ? 'Update Combo' : 'Create Combo'}
          </Button>
        </DialogActions>
      </Dialog>

      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleImageUpload}
      />

      <Dialog 
        open={deleteConfirmOpen} 
        onClose={handleCancelDelete}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" component="div">
            Confirm Delete
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography>
              Are you sure you want to delete the combo offer "{comboToDelete?.ccName}"?
            </Typography>
            {comboToDelete && (
              <Box sx={{ mt: 2, bgcolor: 'background.paper', p: 2, borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Combo Details:
                </Typography>
                <Typography variant="body2">
                  Products: {comboToDelete.ccProducts?.length || 0}
                </Typography>
                <Typography variant="body2">
                  Price: ₹{comboToDelete.ccPrice?.toFixed(2)}
                </Typography>
                <Typography variant="body2">
                  Discount: {comboToDelete.ccOffer}%
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={handleCancelDelete}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmDelete}
            variant="contained" 
            color="error"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <DeleteIcon />}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ComboOffers; 