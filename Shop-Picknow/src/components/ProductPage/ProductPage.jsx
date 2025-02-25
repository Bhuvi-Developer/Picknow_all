import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import CartPage from '../CartPage/CartPage';
import ProductDetail from './ProductDetail';
import './ProductPage.css';
import Nuts from '../../assets/Nuts.jpg';
import honey from '../../assets/honey.jpg';
import { FaHeart, FaShoppingCart, FaStar, FaFilter, FaTimes } from 'react-icons/fa';
import { productApi } from '../../APi/productApi';
import { cartApi } from '../../api/cartApi';
import { useSnackbar } from 'notistack';
import { transformImageUrl } from '../../api/utils';
import { useLocation } from 'react-router-dom';

// Add Rating component
const Rating = ({ selectedRating, handleRatingSelect }) => {
  return (
    <div className="rating">
      {[5, 4, 3, 2, 1].map((rating) => (
        <React.Fragment key={rating}>
          <input
            type="radio"
            id={`star-${rating}`}
            name="star-radio"
            value={`star-${rating}`}
            checked={selectedRating === rating}
            onChange={() => handleRatingSelect(rating)}
          />
          <label htmlFor={`star-${rating}`}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path pathLength="360" d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z" />
            </svg>
          </label>
        </React.Fragment>
      ))}
    </div>
  );
};

const ProductPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [currentPage, setCurrentPage] = useState('listing');
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedRating, setSelectedRating] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [error, setError] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [products, setProducts] = useState([]);
  const location = useLocation();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Check if products were passed through navigation state
      if (location.state?.products) {
        console.log('Products from navigation state:', {
          count: location.state.products.length,
          products: location.state.products,
          title: location.state.title
        });
        setProducts(location.state.products);
      } else {
        // If no products in state, fetch all products
        const response = await productApi.getAllProducts();
        console.log('Products from API:', {
          count: response.products?.length,
          products: response.products
        });
        setProducts(response.products || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  // First useEffect to fetch initial data
  useEffect(() => {
    fetchProducts();
    fetchCartItems();
  }, []);

  // Second useEffect to handle location state changes
  useEffect(() => {
    if (location.state?.products) {
      setProducts(location.state.products);
    }
  }, [location.state]);

  // Add this to monitor products state changes
  useEffect(() => {
    console.log('Products state updated:', {
      count: products.length,
      products: products
    });
  }, [products]);

  const fetchCartItems = async () => {
    try {
      const response = await cartApi.getCart();
      if (response.success) {
        setCartItems(response.cart?.items || []);
      }
    } catch (error) {
      console.error('Error fetching cart items:', error);
    }
  };

  // Update addToCart to use API
  const addToCart = async (e, product, quantity = 1) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if product is already in cart
    const isInCart = cartItems.some(item => item.product._id === product._id);
    if (isInCart) {
      enqueueSnackbar('Product is already in cart', { 
        variant: 'info' 
      });
      return;
    }

    // Validate stock before making API call
    if (!product.pStock || product.pStock < quantity) {
      enqueueSnackbar('Not enough stock available', { 
        variant: 'error' 
      });
      return;
    }

    try {
      setAddingToCart(true);
      const response = await cartApi.addToCart(product._id, quantity);
      
      if (response.success) {
        // Update local cart items
        setCartItems(response.cart?.items || []);
        
        enqueueSnackbar('Product added to cart successfully', { 
          variant: 'success' 
        });
        
        // Update cart count
        const totalItems = response.cart?.items?.reduce(
          (sum, item) => sum + item.quantity, 
          0
        ) || 0;
        
        window.dispatchEvent(new CustomEvent('cartUpdated', { 
          detail: { count: totalItems }
        }));
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      if (error.message === 'Unauthorized access. Please login.') {
        enqueueSnackbar('Please login to add items to cart', { 
          variant: 'warning' 
        });
        navigate('/login', {
          state: { 
            returnUrl: `/products`,
            message: 'Please login to add items to cart'
          }
        });
      } else {
        enqueueSnackbar(error.message || 'Failed to add product to cart', { 
          variant: 'error' 
        });
      }
    } finally {
      setAddingToCart(false);
    }
  };

  const handleProductClick = (productId) => {
    window.open(`/product/${productId}`, '_blank');
  };

  const handlePriceChange = (type, value) => {
    const newValue = parseInt(value) || 0;
    if (type === 'min') {
      setPriceRange([Math.min(newValue, priceRange[1]), priceRange[1]]);
    } else {
      setPriceRange([priceRange[0], Math.max(newValue, priceRange[0])]);
    }
  };

  const handleRatingSelect = (rating) => {
    setSelectedRating(rating === selectedRating ? null : rating);
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const navigateBack = () => {
    setCurrentPage('listing');
  };

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const resetFilters = () => {
    setPriceRange([0, 1000]);
    setSelectedRating(null);
  };

  // Modify the product card to use API data
  const renderProductCard = (product) => {
    console.log('Product in renderProductCard:', product); // Debug log
    const isInCart = cartItems.some(item => item.product._id === product._id);

    return (
      <div 
        key={product._id} 
        className="product-card"
        onClick={() => handleProductClick(product._id)}
      >
        <div className="product-image-container">
          <img 
            src={product.pImage?.[0] ? transformImageUrl(product.pImage[0]) : '/placeholder.jpg'}
            alt={product.pName}
            className="product-image"
            onError={(e) => {
              console.log('Image load error, using placeholder');
              e.target.onerror = null;
              e.target.src = '/placeholder.jpg';
            }}
          />
          <button 
            className="wishlist-button"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <FaHeart />
          </button>
          <button 
            className={`cart-button ${isInCart ? 'in-cart' : ''}`}
            onClick={(e) => addToCart(e, product)}
            disabled={addingToCart || !product.pStock || product.pStock === 0 || isInCart}
            title={isInCart ? 'Already in cart' : ''}
          >
            <FaShoppingCart />
            {product.pStock === 0 && <span className="out-of-stock">Out of Stock</span>}
            {isInCart && <span className="in-cart-text">In Cart</span>}
          </button>
        </div>
        <div className="product-info">
          <div className="product-category">{product.pCategory}</div>
          <h3 className="product-name">{product.pName}</h3>
          <div className="product-weight">{product.pQuantity}g</div>
          <div className="product-rating">
            <FaStar className="star-icon" />
            <span>({product.pRating || 0})</span>
          </div>
          <div className="product-price">
            <span className="current-price">₹{product.pPrice}</span>
            {product.pOffer > 0 && (
              <>
                <span className="original-price">
                  ₹{Math.round(product.pPrice * (100 / (100 - product.pOffer)))}
                </span>
                <span className="discount-badge">{product.pOffer}% OFF</span>
              </>
            )}
          </div>
          <button 
            className="buy-button"
            onClick={(e) => {
              e.stopPropagation();
              handleProductClick(product._id);
            }}
          >
            Buy Now
          </button>
        </div>
      </div>
    );
  };

  if (currentPage === 'cart') {
    return (
      <CartPage
        cart={cart}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
        navigateBack={navigateBack}
      />
    );
  }

  return (
    <div className="best-selling">
      {/* Background Animation */}
      <div className="background-animation">
        <div className="background-text">PickNow</div>
        <div className="background-text">PickNow</div>
        <div className="background-text">PickNow</div>
        <div className="floating-circle circle-1" />
        <div className="floating-circle circle-2" />
        <div className="floating-circle circle-3" />
      </div>

      <div className="product-layout">
        {/* Filter Overlay */}
        <div 
          className={`filter-overlay ${isFilterOpen ? 'active' : ''}`}
          onClick={() => {
            setIsFilterOpen(false);
            document.body.style.overflow = 'auto';
          }}
        />

        {/* Filter Sidebar */}
        <div className={`filter-sidebar ${isFilterOpen ? 'active' : ''}`}>
          <button 
            className="close-filter"
            onClick={() => {
              setIsFilterOpen(false);
              document.body.style.overflow = 'auto';
            }}
          >
            <FaTimes />
          </button>
          <div className="filter-section">
            <h3>
              Filter By Price
              <button onClick={resetFilters} className="reset-btn">Reset</button>
            </h3>
            <div className="price-range">
              <div className="price-inputs">
                <div className="price-input-group">
                  <label>Min Price</label>
                  <input
                    type="number"
                    value={priceRange[0]}
                    min="0"
                    max={priceRange[1]}
                    onChange={(e) => handlePriceChange('min', e.target.value)}
                  />
                </div>
                <div className="price-input-group">
                  <label>Max Price</label>
                  <input
                    type="number"
                    value={priceRange[1]}
                    min={priceRange[0]}
                    max="1000"
                    onChange={(e) => handlePriceChange('max', e.target.value)}
                  />
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="1000"
                value={priceRange[1]}
                onChange={(e) => handlePriceChange('max', e.target.value)}
              />
            </div>
          </div>

          <div className="filter-section">
            <h3>Product Rating</h3>
            <div className="rating-options">
              <Rating selectedRating={selectedRating} handleRatingSelect={handleRatingSelect} />
            </div>
          </div>
        </div>

        {/* Products Container */}
        <div className="products-container">
          <div className="products-header">
            <button className="mobile-toggle" onClick={toggleFilter}>
              {isFilterOpen ? (
                <>
                  <FaTimes className="filter-icon" />
                  <span>Close</span>
                </>
              ) : (
                <>
                  <FaFilter className="filter-icon" />
                  <span>Filter</span>
                </>
              )}
            </button>
            <select className="sort-select">
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Rating</option>
            </select>
          <span className="products-count">We found {filteredProducts.length} items for you!</span>
          </div>

          <div className="products-grid">
            {loading ? (
              <div className="loading">Loading products...</div>
            ) : error ? (
              <div className="error">{error}</div>
            ) : products.length === 0 ? (
              <div className="no-products">No products found</div>
            ) : (
              products.map(product => {
                console.log('Rendering product:', product); // Debug log
                return renderProductCard(product);
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
