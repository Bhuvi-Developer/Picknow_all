import React, { useState, useEffect } from 'react';
import './HotDeals.css';
import { FaHeart, FaShoppingBasket, FaCheck } from 'react-icons/fa';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import herbals2 from '../../assets/herbals2.jpg';

const HotDeals = () => {
    const [cartItems, setCartItems] = useState(new Set());
    const [wishlistItems, setWishlistItems] = useState(new Set());
    const [cartCount, setCartCount] = useState(0);

    // Update cart count in localStorage and navbar
    const updateCartCount = (count) => {
        localStorage.setItem('cartCount', count);
        // Dispatch custom event to notify navbar
        window.dispatchEvent(new CustomEvent('cartUpdated', { detail: count }));
    };

    // Initialize cart count from localStorage
    useEffect(() => {
        const storedCount = localStorage.getItem('cartCount');
        if (storedCount) {
            setCartCount(parseInt(storedCount));
        }
    }, []);

    const products = [
        {
            id: 1,
            name: "PRODUCTS NAME HERE",
            image: herbals2,
            price: 120,
            originalPrice: 140,
            discount: 13
        },
        {
            id: 2,
            name: "PRODUCTS NAME HERE",
            image: "https://demo-vue-food01.storehippo.com/s/63d75dbe82d5b000817f9156/63c7acadad183d0019e63a02/product-9-480x480.jpg",
            price: 260,
            originalPrice: 300,
            discount: 13
        },
        {
            id: 3,
            name: "PRODUCTS NAME HERE",
            image: "https://demo-vue-food01.storehippo.com/s/63d75dbe82d5b000817f9156/63c7ac8aad183d0019e63946/product-8-480x480.jpg",
            price: 260,
            originalPrice: 300,
            discount: 13
        },
        {
            id: 4,
            name: "PRODUCTS NAME HERE",
            image: "https://demo-vue-food01.storehippo.com/s/63d75dbe82d5b000817f9156/63c7ac183d68fc00b98fe932/product-6-480x480.jpg",
            price: 300,
            originalPrice: 350,
            discount: 14
        },
        {
            id: 5,
            name: "PRODUCTS NAME HERE",
            image: "https://demo-vue-food01.storehippo.com/s/63d75dbe82d5b000817f9156/63c7ab613d68fc00b98fe5ca/product-4-480x480.jpg",
            price: 100
        },
        {
            id: 6,
            name: "PRODUCTS NAME HERE",
            image: "https://demo-vue-food01.storehippo.com/s/63d75dbe82d5b000817f9156/63c7a4db3d68fc00b98fc727/product-1-480x480.jpg",
            price: 250,
            originalPrice: 280,
            discount: 10
        },
        {
            id: 7,
            name: "PRODUCTS NAME HERE",
            image: "https://demo-vue-food01.storehippo.com/s/63d75dbe82d5b000817f9156/63c7d0c804ce8a0082121108/product-9-480x480.jpg",
            price: 260,
            originalPrice: 300,
            discount: 13
        },
        {
            id: 8,
            name: "PRODUCTS NAME HERE",
            image: "https://demo-vue-food01.storehippo.com/s/63d75dbe82d5b000817f9156/63c7d0bd04ce8a00821210c8/product-8-480x480.jpg",
            price: 260,
            originalPrice: 300,
            discount: 13
        },
        {
            id: 9,
            name: "PRODUCTS NAME HERE",
            image: "https://demo-vue-food01.storehippo.com/s/63d75dbe82d5b000817f9156/63c7d0a904ce8a0082120fbe/product-6-480x480.jpg",
            price: 300,
            originalPrice: 350,
            discount: 14
        },
        {
            id: 10,
            name: "PRODUCTS NAME HERE",
            image: "https://demo-vue-food01.storehippo.com/s/63d75dbe82d5b000817f9156/63c7d09e04ce8a0082120f89/product-4-480x480.jpg",
            price: 100
        }
    ];

    // Slider settings
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 5,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        responsive: [
            {
                breakpoint: 1200,
                settings: {
                    slidesToShow: 4,
                }
            },
            {
                breakpoint: 992,
                settings: {
                    slidesToShow: 3,
                }
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 2,
                }
            },
            {
                breakpoint: 576,
                settings: {
                    slidesToShow: 1,
                }
            }
        ]
    };

    const handleAddToCart = (e, product) => {
        e.preventDefault();
        setCartItems(prev => {
            const newItems = new Set(prev);
            if (newItems.has(product.id)) {
                newItems.delete(product.id);
                // Decrease cart count
                const newCount = cartCount - 1;
                setCartCount(newCount);
                updateCartCount(newCount);
            } else {
                newItems.add(product.id);
                // Increase cart count
                const newCount = cartCount + 1;
                setCartCount(newCount);
                updateCartCount(newCount);
                
                // Add to cart storage
                const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
                existingCart.push({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    quantity: 1
                });
                localStorage.setItem('cart', JSON.stringify(existingCart));
            }
            return newItems;
        });
    };

    const handleAddToWishlist = (e, product) => {
        e.preventDefault();
        setWishlistItems(prev => {
            const newItems = new Set(prev);
            if (newItems.has(product.id)) {
                newItems.delete(product.id);
            } else {
                newItems.add(product.id);
                // Add your wishlist integration here
                console.log('Added to wishlist:', product);
            }
            return newItems;
        });
    };

    return (
        <div className="container">
            <div className="heading-tab">
                <div className="heading-left">
                    <a href="/collection/hot-deals">
                        <h2 className="heading">Hot Deals</h2>
                    </a>
                    <p>
                        <span>There are many variations of passages of Lorem Ipsum available</span>
                    </p>
                </div>
            </div>

            <div className="section-content">
                <Slider {...settings}>
                    {products.map(product => (
                        <div key={product.id} className="px-2">
                            <div className="overflow-hidden position-relative product-grid-item bg-white d-flex flex-column flex-nowrap h-100 w-100 fs-6 position-relative text-wrap">
                                <div className="product-head position-relative overflow-hidden col-auto w-100">
                                    {product.discount && (
                                        <span className="bg-secondary text-dark small top-0 position-absolute start-0 top-0 px-2 py-1 w-auto" 
                                              style={{zIndex: 1, borderBottomRightRadius: '15px'}}>
                                            -{product.discount}%
                                        </span>
                                    )}
                                    <div className="product-thumb position-relative overflow-hidden bg-white w-100">
                                        <a className="d-block h-100 w-100" href={`/product/${product.name.toLowerCase().replace(/ /g, '-')}`}>
                                            <img 
                                                loading="lazy"
                                                alt={product.name}
                                                title={product.name}
                                                src={product.image}
                                                className="grid-image img-fluid w-100"
                                            />
                                        </a>
                                    </div>
                                    <div className="product-grid-buttons">
                                        <div className="d-flex flex-wrap align-items-center justify-content-center">
                                            <div className="d-flex justify-content-center">
                                                <a role="button" 
                                                   className={`d-flex align-items-center justify-content-center rounded-1 p-2 mx-1 ${wishlistItems.has(product.id) ? 'active' : ''}`}
                                                   title={wishlistItems.has(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                                                   onClick={(e) => handleAddToWishlist(e, product)}>
                                                    <FaHeart className={`lh-1 fs-5 ${wishlistItems.has(product.id) ? 'text-white' : 'text-primary'}`} />
                                                </a>
                                                <a className={`d-flex align-items-center justify-content-center rounded-1 p-2 mx-1 ${cartItems.has(product.id) ? 'active' : ''}`}
                                                   role="button" 
                                                   title={cartItems.has(product.id) ? "Remove from Cart" : "Add to Cart"}
                                                   onClick={(e) => handleAddToCart(e, product)}>
                                                    {cartItems.has(product.id) ? (
                                                        <FaCheck className="lh-1 fs-5 text-white" />
                                                    ) : (
                                                        <FaShoppingBasket className="lh-1 fs-5 text-primary" />
                                                    )}
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="product-body py-2 px-2 px-md-0 flex-fill w-100">
                                    <div className="caption-inner h-100">
                                        <div className="d-flex flex-column flex-nowrap h-100">
                                            <div className="flex-fill w-100">
                                                <div className="w-100 mb-2">
                                                    <a className="lh-sm m-0 d-block text-dark text-decoration-none fw-semibold" 
                                                       href={`/product/${product.name.toLowerCase().replace(/ /g, '-')}`}>
                                                        {product.name}
                                                    </a>
                                                </div>
                                                <div className="position-relative w-100">
                                                    <div className="text-nowrap d-flex align-items-baseline">
                                                        <span className="fw-bold d-inline-block lh-1 text-primary">₹{product.price}</span>
                                                        {product.originalPrice && (
                                                            <span className="d-block lh-1 text-decoration-line-through text-muted ms-2">
                                                                ₹{product.originalPrice}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </Slider>
            </div>
        </div>
    );
};

export default HotDeals; 