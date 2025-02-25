import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, ShoppingBag, AlertCircle } from 'lucide-react';
import { useSnackbar } from 'notistack';
import './CartPage.css';
import { cartApi } from '../../api/cartApi';
import axiosInstance from '../../api/axiosInstance';
import { transformImageUrl } from '../../api/utils';

const CartPage = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await cartApi.getCart();
      console.log('Cart Response:', response);
      
      if (response.success) {
        const cartItems = response.cart?.items || [];
        console.log('Cart Items:', cartItems);
        
        // Transform the items to include proper image URLs
        const itemsWithDetails = cartItems.map(item => ({
          ...item,
          product: {
            ...item.product,
            pImage: Array.isArray(item.product.pImage) 
              ? item.product.pImage.map(transformImageUrl)
              : []
          }
        }));

        setCart(itemsWithDetails);
        updateCartCount(itemsWithDetails);
      } else {
        enqueueSnackbar(response.message || 'Failed to fetch cart', { 
          variant: 'error' 
        });
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      enqueueSnackbar(error.message || 'Failed to fetch cart items', { 
        variant: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const updateCartCount = (items) => {
    const totalItems = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    window.dispatchEvent(new CustomEvent('cartUpdated', { 
      detail: { count: totalItems }
    }));
  };

  const handleUpdateQuantity = async (productId, newQuantity) => {
    try {
      if (newQuantity < 1) {
        await handleRemoveItem(productId);
        return;
      }

      // Find the item to check stock
      const item = cart.find(item => item.product._id === productId);
      if (!item) return;

      // Check if new quantity exceeds stock
      if (newQuantity > item.product.pStock) {
        enqueueSnackbar(`Cannot add more than ${item.product.pStock} items (stock limit)`, { 
          variant: 'warning',
          autoHideDuration: 3000,
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'center'
          }
        });
        // Set quantity to max stock available
        newQuantity = item.product.pStock;
      }

      // Optimistically update the UI
      setCart(prevCart => 
        prevCart.map(item => 
          item.product._id === productId 
            ? { ...item, quantity: newQuantity }
            : item
        )
      );

      const response = await cartApi.updateQuantity(productId, newQuantity);
      
      if (response.success) {
        // Update cart count
        const totalItems = response.cart?.items?.reduce(
          (sum, item) => sum + item.quantity, 
          0
        ) || 0;
        
        window.dispatchEvent(new CustomEvent('cartUpdated', { 
          detail: { count: totalItems }
        }));
      } else {
        // Revert the optimistic update if the API call fails
        await fetchCart();
        throw new Error(response.message || 'Failed to update cart');
      }
    } catch (error) {
      console.error('Error updating cart:', error);
      enqueueSnackbar(error.message || 'Failed to update cart', { 
        variant: 'error' 
      });
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      setLoading(true);
      console.log('Removing product:', productId); // Debug log

      const response = await cartApi.removeItem(productId);
      console.log('Remove response:', response); // Debug log
      
      if (response.success) {
        // Update local cart state with the new cart data
        const updatedCartItems = response.cart?.items || [];
        const transformedItems = updatedCartItems.map(item => ({
          ...item,
          product: {
            ...item.product,
            pImage: Array.isArray(item.product.pImage) 
              ? item.product.pImage.map(transformImageUrl)
              : []
          }
        }));

        setCart(transformedItems);
        updateCartCount(transformedItems);
        enqueueSnackbar('Item removed from cart', { variant: 'success' });
      } else {
        throw new Error(response.message || 'Failed to remove item');
      }
    } catch (error) {
      console.error('Error removing item:', error);
      enqueueSnackbar(error.message || 'Failed to remove item', { 
        variant: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = () => {
    navigate('/payment', {
      state: {
        cart: cart,
        totalAmount: calculateTotal(),
        isFromCart: true
      }
    });
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.product.pPrice * item.quantity), 0);
  };

  if (loading) {
    return (
      <div className="cart-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="empty-cart">
        <ShoppingBag size={48} />
        <h2>Your cart is empty</h2>
        <p>Looks like you haven't added anything to your cart yet</p>
        <Link to="/" className="continue-shopping">
          <ArrowLeft className="icon" />
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-header">
        <h1>Shopping Cart ({cart.length} items)</h1>
      </div>

      <div className="cart-content">
        <div className="cart-items">
          {cart.map((item) => {
            if (!item.product) return null;
            
            // Get the first image URL or use placeholder
            const imageUrl = item.product.pImage?.[0] || '/placeholder.jpg';
            console.log('Product Image URL:', imageUrl); // Debug log
            
            return (
              <div key={item.product._id} className="cart-item">
                <img 
                  src={imageUrl}
                  alt={item.product.pName} 
                  className="cart-item-image"
                  onError={(e) => {
                    console.log('Image load error, using placeholder');
                    e.target.src = '/placeholder.jpg';
                    e.target.onerror = null; // Prevent infinite loop
                  }}
                />
                <div className="cart-item-info">
                  <h3>{item.product.pName}</h3>
                  <p className="item-weight">{item.product.pQuantity}g</p>
                  <div className="price-section">
                    <span className="current-price">₹{item.product.pPrice}</span>
                    {item.product.pOffer > 0 && (
                      <>
                        <span className="original-price">
                          ₹{Math.round(item.product.pPrice * (100 / (100 - item.product.pOffer)))}
                        </span>
                        <span className="discount-badge">{item.product.pOffer}% OFF</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="cart-item-controls">
                  <div className="quantity-controls">
                    <button 
                      className="quantity-btn"
                      onClick={() => handleUpdateQuantity(item.product._id, item.quantity - 1)}
                      disabled={loading || item.quantity <= 1}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      className="quantity-input"
                      value={item.quantity}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 1;
                        handleUpdateQuantity(item.product._id, value);
                      }}
                      min="1"
                      max={item.product.pStock}
                      onBlur={(e) => {
                        // Ensure value is within bounds when input loses focus
                        const value = parseInt(e.target.value) || 1;
                        if (value > item.product.pStock) {
                          handleUpdateQuantity(item.product._id, item.product.pStock);
                        } else if (value < 1) {
                          handleUpdateQuantity(item.product._id, 1);
                        }
                      }}
                    />
                    <button 
                      className="quantity-btn"
                      onClick={() => handleUpdateQuantity(item.product._id, item.quantity + 1)}
                      disabled={loading || item.quantity >= item.product.pStock}
                    >
                      +
                    </button>
                    {item.quantity >= item.product.pStock && (
                      <div className="stock-limit-warning">
                        Max stock reached
                      </div>
                    )}
                  </div>
                  <button 
                    className="remove-button"
                    onClick={() => handleRemoveItem(item.product._id)}
                    disabled={loading}
                    title="Remove item"
                  >
                    <Trash2 className="icon" />
                  </button>
                </div>

                {item.product.pStock <= 10 && (
                  <div className="stock-warning">
                    <AlertCircle size={16} />
                    <span>Only {item.product.pStock} left in stock</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="cart-summary">
          <h2>Order Summary</h2>
          <div className="summary-details">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{calculateTotal()}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>₹{calculateTotal()}</span>
            </div>
          </div>
          <button 
            className="checkout-button" 
            onClick={handleCheckout}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Proceed to Checkout'}
          </button>
          <div className="secure-checkout">
            <span>🔒 Secure Checkout</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
