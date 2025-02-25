import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { FaStar, FaChevronUp, FaChevronDown, FaShoppingCart, FaHeart } from 'react-icons/fa';
import './ProductDetail.css';
import dryFruit1 from '../../assets/dryfruits.jpg';
import Nuts from '../../assets/Nuts.jpg';
import api from '../../APi/api';
import { productApi } from '../../api/productApi';
import { cartApi } from '../../api/cartApi';
import { useSnackbar } from 'notistack';
import { transformImageUrl } from '../../api/utils';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isZoomVisible, setIsZoomVisible] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [lensPosition, setLensPosition] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [addingToCart, setAddingToCart] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState('');

  const containerRef = useRef(null);
  const lensRef = useRef(null);
  const zoomWindowRef = useRef(null);
  const zoomImageRef = useRef(null);

  const ZOOM_LEVEL = 2.5;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await productApi.getProductById(id);
        if (response.success) {
          const productData = {
            ...response.product,
            pImage: response.product.pImage.map(transformImageUrl)
          };
          setProduct(productData);
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product details');
        enqueueSnackbar(err.message || 'Failed to load product details', { 
          variant: 'error' 
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, enqueueSnackbar]);

  useEffect(() => {
    if (product?._id) {
      fetchReviews();
    }
  }, [product?._id]);

  const fetchReviews = async () => {
    try {
      const response = await productApi.getReviews(product._id);
      if (response.success) {
        setReviews(response.reviews);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const addToCart = async (e) => {
    e.preventDefault();
    if (!product) return;

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
        enqueueSnackbar('Product added to cart successfully', { 
          variant: 'success' 
        });
        
        // Update cart count in header
        if (response.cart?.items) {
          const totalItems = response.cart.items.reduce(
            (sum, item) => sum + item.quantity, 
            0
          );
          window.dispatchEvent(new CustomEvent('cartUpdated', { 
            detail: { count: totalItems }
          }));
        }
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      if (error.message === 'Unauthorized access. Please login.') {
        enqueueSnackbar('Please login to add items to cart', { 
          variant: 'warning' 
        });
        navigate('/login', {
          state: { 
            returnUrl: `/product/${id}`,
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

  const handleBuyNow = async () => {
    try {
      // First try to add to cart
      await addToCart({ preventDefault: () => {} });
      
      // If successful, navigate to payment
      navigate('/payment', {
        state: {
          cart: [{
            id: product._id,
            name: product.pName,
            price: product.pPrice,
            quantity,
            image: product.pImage[0],
            weight: product.pQuantity + 'g'
          }],
          totalAmount: product.pPrice * quantity,
          isFromCart: false
        }
      });
    } catch (error) {
      // Error handling is done in addToCart
      console.error('Error in buy now:', error);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await productApi.addReview(product._id, userRating, userReview);
      if (response.success) {
        await fetchReviews();
        setUserRating(0);
        setUserReview('');
        enqueueSnackbar('Review added successfully', { variant: 'success' });
      }
    } catch (error) {
      enqueueSnackbar(error.message || 'Failed to add review', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <FaStar
        key={index}
        className={`star ${index < rating ? 'filled' : 'empty'}`}
        onClick={() => !loading && setUserRating(index + 1)}
      />
    ));
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading product details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="error-container">
        <p>Product not found</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  // Update the image URL construction
  const productImages = product?.pImage?.map((img, index) => ({
    id: index + 1,
    url: img.startsWith('http') 
      ? img 
      : `${process.env.REACT_APP_API_URL}/uploads/${img}`,
    alt: `${product.pName} view ${index + 1}`
  })) || [
    {
      id: 1,
      url: Nuts,
      alt: 'Default product image'
    }
  ];

  const handleThumbnailClick = (index) => {
    setSelectedImage(index);
  };

  const handleMouseEnter = () => {
    if (lensRef.current && zoomWindowRef.current) {
      lensRef.current.style.display = 'block';
      setIsZoomVisible(true);

      const rect = containerRef.current.getBoundingClientRect();
      setZoomPosition({
        x: rect.right + 20,
        y: rect.top
      });
    }
  };

  const handleMouseLeave = () => {
    const mainImage = containerRef.current?.querySelector('.main-image');
    if (mainImage) {
      mainImage.style.transform = 'scale(1)';
    }
  };

  const handleMouseMove = (e) => {
    if (!containerRef.current || !lensRef.current || !zoomImageRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let lensX = x - lensRef.current.offsetWidth / 2;
    let lensY = y - lensRef.current.offsetHeight / 2;

    const maxX = containerRef.current.offsetWidth - lensRef.current.offsetWidth;
    const maxY = containerRef.current.offsetHeight - lensRef.current.offsetHeight;

    lensX = Math.max(0, Math.min(lensX, maxX));
    lensY = Math.max(0, Math.min(lensY, maxY));

    setLensPosition({ x: lensX, y: lensY });

    if (zoomImageRef.current) {
      zoomImageRef.current.style.width = `${containerRef.current.offsetWidth * ZOOM_LEVEL}px`;
      zoomImageRef.current.style.height = `${containerRef.current.offsetHeight * ZOOM_LEVEL}px`;
      zoomImageRef.current.style.left = `-${lensX * ZOOM_LEVEL}px`;
      zoomImageRef.current.style.top = `-${lensY * ZOOM_LEVEL}px`;
    }
  };

  // Handle zoom functionality
  const handleZoom = (e) => {
    if (!containerRef.current) return;

    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    
    // Calculate cursor position relative to the container
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    // Update main image zoom
    const mainImage = containerRef.current.querySelector('.main-image');
    if (mainImage) {
      mainImage.style.transform = 'scale(2.5)';
      mainImage.style.transformOrigin = `${x}% ${y}%`;
    }
  };

  return (
    <div className="product-detail-container">
      <div className="product-detail-wrapper">
        <div className="product-content">
          <div className="left-column">
            <div className="main-image-container" ref={containerRef}>
              <img 
                src={productImages[selectedImage].url} 
                alt={product?.pName}
                className="main-image"
                onMouseMove={handleZoom}
                onMouseLeave={handleMouseLeave}
              />
              <div className="zoom-hint">Hover to zoom</div>
            </div>
            
            <div className="thumbnails-wrapper">
              {productImages.map((image, index) => (
                <div 
                  key={index}
                  className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img src={image.url} alt={`view ${index + 1}`} className="thumbnail-image" />
                </div>
              ))}
            </div>
          </div>

          <div className="right-column">
            <div className="product-header">
              <h1 className="product-title">{product?.pName}</h1>
              <div className="product-meta">
                <div className="rating">
                  <div className="stars">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} className={i < (product?.pRating || 4) ? 'filled' : ''} />
                    ))}
                  </div>
                  <span className="rating-count">{product?.reviews || '120'} Reviews</span>
                </div>
                <div className="product-id">SKU: {product?._id?.slice(-8)}</div>
              </div>
            </div>

            <div className="price-section">
              <div className="price-container">
                <span className="current-price">₹{product?.pPrice}</span>
                {product?.pOffer > 0 && (
                  <>
                    <span className="original-price">₹{Math.round(product.pPrice * (100 / (100 - product.pOffer)))}</span>
                    <span className="discount-badge">{product.pOffer}% OFF</span>
                  </>
                )}
              </div>
              <div className="stock-status">
                <span className={`status ${product?.pStock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                  {product?.pStock > 0 ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
            </div>

            <div className="product-description">
              <p>{product?.pDescription}</p>
            </div>

            <div className="product-options">
              <div className="quantity-selector">
                <label>Quantity</label>
                <div className="quantity-controls">
                  <button 
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span>{quantity}</span>
                  <button 
                    onClick={() => setQuantity(prev => 
                      Math.min(product?.pStock || 1, prev + 1)
                    )}
                    disabled={quantity >= (product?.pStock || 1)}
                  >
                    +
                  </button>
                </div>
                {product?.pStock <= 10 && (
                  <div className="stock-warning">
                    Only {product.pStock} items left in stock
                  </div>
                )}
              </div>
            </div>

            <div className="action-buttons">
              <button 
                className="add-to-cart"
                onClick={addToCart}
                disabled={addingToCart || !product.pStock || product.pStock === 0}
              >
                <FaShoppingCart className="icon" />
                {addingToCart ? 'Adding...' : 'Add to Cart'}
              </button>
              <button 
                className="buy-now"
                onClick={handleBuyNow}
                disabled={addingToCart || !product.pStock || product.pStock === 0}
              >
                {addingToCart ? 'Processing...' : 'Buy Now'}
              </button>
            </div>

            <div className="additional-info">
              <div className="info-item">
                <span className="icon">🚚</span>
                <div className="info-content">
                  <h4>Free Delivery</h4>
                  <p>Enter your postal code for delivery availability</p>
                </div>
              </div>
              <div className="info-item">
                <span className="icon">↩️</span>
                <div className="info-content">
                  <h4>Return Delivery</h4>
                  <p>Free 30 Days Delivery Returns</p>
                </div>
              </div>
            </div>

            <div className="reviews-section">
              <h3>Customer Reviews</h3>
              
              {/* Review Form */}
              <form onSubmit={handleSubmitReview} className="review-form">
                <div className="rating-input">
                  {renderStars(userRating)}
                </div>
                <textarea
                  value={userReview}
                  onChange={(e) => setUserReview(e.target.value)}
                  placeholder="Write your review..."
                  required
                  disabled={loading}
                />
                <button 
                  type="submit" 
                  disabled={loading || !userRating}
                  className="submit-review-btn"
                >
                  {loading ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>

              {/* Reviews List */}
              <div className="reviews-list">
                {reviews.map((review) => (
                  <div key={review._id} className="review-item">
                    <div className="review-header">
                      <span className="reviewer-name">{review.user.name}</span>
                      <div className="review-stars">
                        {renderStars(Number(review.rating))}
                      </div>
                    </div>
                    <p className="review-text">{review.review}</p>
                    <span className="review-date">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;