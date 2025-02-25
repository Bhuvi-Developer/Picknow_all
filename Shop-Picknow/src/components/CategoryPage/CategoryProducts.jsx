import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaShoppingCart, FaHeart, FaStar } from 'react-icons/fa';
import herbals from '../../assets/herbals.jpg'
import herbals2 from '../../assets/herbals2.jpg'
import herbals3 from '../../assets/herbals3.jpg'
import herbals4 from '../../assets/herbals4.jpg'
import './CategoryProducts.css';

const CategoryProducts = () => {
  const { id } = useParams();
  const [cart, setCart] = useState(() => {
  const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const categoryNames = {
    '1': 'Herbals',
    '2': 'Millet Cookies',
    '3': 'Millet Noodles',
    '4': 'Honey',
    '5': 'Dry Fruties',
    '6': 'Traditional Rise'
  };

  // Sample products based on category
  const categoryProducts = {
    '1': [
      {
        id: 1,
        name: 'Herbals /மலைத்தேன்',
        weight: '200 G | 1 Pc',
        price: 499,
        originalPrice: 599,
        image:herbals2 ,
        rating: 4,
        reviews: 228,
        description: 'Pure wild forest honey collected from natural sources.',
        category: 'Honey'
      },
      {
        id: 2,
        name: 'Wild forest honey /மலைத்தேன்',
        weight: '500 G | 1 Pc',
        price: 899,
        originalPrice: 999,
        image: herbals,
        rating: 4.5,
        reviews: 156,
        description: 'Pure wild forest honey collected from natural sources.',
        category: 'Honey'
      },
      {
        id: 3,
        name: 'Wild forest honey /மலைத்தேன்',
        weight: '500 G | 1 Pc',
        price: 899,
        originalPrice: 999,
        image: herbals3,
        rating: 4.5,
        reviews: 156,
        description: 'Pure wild forest honey collected from natural sources.',
        category: 'Honey'
      },
      {
        id: 4,
        name: 'Wild forest honey /மலைத்தேன்',
        weight: '500 G | 1 Pc',
        price: 899,
        originalPrice: 999,
        image: herbals4,
        rating: 4.5,
        reviews: 156,
        description: 'Pure wild forest honey collected from natural sources.',
        category: 'Honey'
      },
      // Add more products for category 1
    ],
    // Add products for other categories
  };

  const products = categoryProducts[id] || [];

  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      const newCart = [...prevCart, { ...product, quantity: 1 }];
      localStorage.setItem('cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  useEffect(() => {
    // Update cart in localStorage whenever it changes
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  return (
    <div className="cp-container">
      <div className="cp-header">
        <h1>{categoryNames[id] || 'Products'}</h1>
        <p>{products.length} products found</p>
      </div>

      <div className="cp-grid">
        {products.map(product => (
          <div key={product.id} className="cp-card">
            <div className="cp-image-container">
              <img src={product.image} alt={product.name} className="cp-image" />
              <button className="cp-wishlist-button">
                <FaHeart />
              </button>
              <button 
                className="cp-cart-button" 
                onClick={(e) => {
                  e.stopPropagation();
                  addToCart(product);
                }}
              >
                <FaShoppingCart />
              </button>
            </div>
            <div className="cp-info">
              <div className="cp-category">{product.category}</div>
              <h3 className="cp-name">{product.name}</h3>
              <div className="cp-weight">{product.weight}</div>
              <div className="cp-rating">
                <FaStar className="cp-star-icon" />
                <span>{product.rating} ({product.reviews})</span>
              </div>
              <div className="cp-price">
                <span className="cp-current-price">₹{product.price}</span>
                <span className="cp-original-price">₹{product.originalPrice}</span>
              </div>
              <button 
                className="cp-buy-button"
                onClick={() => {
                  addToCart(product);
                  // Navigate to cart or payment page
                }}
              >
                Buy Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryProducts;