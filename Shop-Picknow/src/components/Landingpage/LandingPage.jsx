import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Carousel from './Carousel';
import ShinyText from './ShinyText';
import './LandingPage.css';
import dryFruit1 from '../../assets/dryfruits.jpg';
import honey from '../../assets/honey.jpg';
import Nuts from '../../assets/Nuts.jpg';
import { FaShoppingCart, FaHeart, FaLink, FaStar } from 'react-icons/fa';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { Link } from 'react-router-dom';
import Footer from '../Footer/Footer';
import CategoryNav from '../Navbar/CategoryNav';
import BannerSection from '../BannerSection/BannerSection';
import CategorySlider from '../CategorySlider/CategorySlider';

import WhyChooseUs from '../WhyChooseUs/WhyChooseUs';
import HotDeals from '../HotDeals/HotDeals';


// const BestSellingProduct = ({ image, category, name, weight, rating, originalPrice, discountedPrice }) => {
//   return (
//     <div className="best-selling-product">
//       <div className="product-image-container">
//         <img src={image} alt={name} className="product-image" />
//         <button className="wishlist-btn">
//           <FaHeart />
//         </button>
//         <button className="cart-btn">
//           <FaShoppingCart />
//         </button>
//       </div>
//       <div className="product-details">
//         <span className="category">{category}</span>
//         <h3 className="product-name">{name}</h3>
//         <span className="weight">{weight}</span>
//         <div className="rating">
//           <span className="stars">
//             <FaStar />
//           </span>
//           <span className="rating-value">({rating})</span>
//         </div>
//         <div className="price">
//           <span className="discounted-price">₹{discountedPrice}</span>
//           <span className="original-price">₹{originalPrice}</span>
//         </div>
//         <button className="buy-now">Buy Now</button>
//       </div>
//     </div>
//   );
// };

const ProductPage = ({ image, title, price, rating }) => {
  return (
    <div className="noo-product-inner">
      <div className="noo-product-thumbnail">
        <a href="#">
          <img src={image} alt={title} />
        </a>
        <div className="noo-rating">
          {[...Array(5)].map((_, index) => (
            <FaStar
              key={index}
              color={index < rating ? "#ffc107" : "#e4e5e9"}
              size={14}
            />
          ))}
        </div>
      </div>
      <div className="noo-product-title">
        <h3><a href="#">{title}</a></h3>
        <span className="price">
          <span className="amount">${price}</span>
        </span>
      </div>
      <div className="noo-product-action">
        <div className="noo-action">
          <button className="add-to-cart" title="Add to Cart">
            <FaShoppingCart />
          </button>
          <button className="add-to-wishlist" title="Add to Wishlist">
            <FaHeart />
          </button>
          <button className="view-details" title="View Details">
            <FaLink />
          </button>
        </div>
      </div>
    </div>
  );
};

const LandingPage = () => {
  const [comboProducts, setComboProducts] = useState([]);
  const [error, setError] = useState(null);

  // Add this new useEffect for scroll to top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []); // Empty dependency array means this runs once when component mounts

  // Fetch combo offers
  useEffect(() => {
    const fetchComboOffers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/products/combo-offers');
        setComboProducts(response.data);
      } catch (err) {
        console.error('Error fetching combo offers:', err);
        setError('Failed to load combo offers');
      }
    };

    fetchComboOffers();
  }, []);

  const bestSellingProducts = [
    {
      id: 1,
      image: dryFruit1,
      category: "Dry fruits",
      name: "Badam/பாதாம்",
      weight: "100g",
      rating: "4.5",
      discountedPrice: "99",
      originalPrice: "120"
    },
    {
      id: 2,
      image: dryFruit1,
      category: "Dry fruits",
      name: "Badam/பாதாம்",
      weight: "100g",
      rating: "4.5",
      discountedPrice: "99",
      originalPrice: "120"
    },
    {
      id: 3,
      image: dryFruit1,
      category: "Dry fruits",
      name: "Badam/பாதாம்",
      weight: "100g",
      rating: "4.5",
      discountedPrice: "99",
      originalPrice: "120"
    },
    {
      id: 4,
      image: dryFruit1,
      category: "Dry fruits",
      name: "Badam/பாதாம்",
      weight: "100g",
      rating: "4.5",
      discountedPrice: "99",
      originalPrice: "120"
    }
  ];

  const products = [
    {
      id: 1,
      image: dryFruit1,
      title: "Premium Dry Fruits Mix",
      price: "24.99",
      rating: 5
    },
    {
      id: 2,
      image: honey,
      title: "Organic Mixed Nuts",
      price: "19.99",
      rating: 4
    },
    {
      id: 3,
      image: Nuts,
      title: "Raw Forest Honey",
      price: "15.99",
      rating: 5
    },
    {
      id: 4,
      image: Nuts,
      title: "Fresh Medjool Dates",
      price: "12.99",
      rating: 4
    }
  ];

  return (
    <div className="landing-page">
      <div className='categoryNav'>
        <CategoryNav />
      </div>

      <section className="hero-section">
        <Carousel />
      </section>

      <section className="welcome-section">
        <ShinyText
          text="Welcome to PickNow"
          speed={3}
          className="welcome-title"
        />
        <p className="welcome-subtitle">Discover Nature's Finest Selection</p>
      </section>

      {/* Category Slider after welcome section */}
      <CategorySlider />

      {/* Banner Section */}
      <BannerSection />
      
      <HotDeals />

      {/* Best Selling Section */}
      {/* <section className="best-selling-section">
        <div className="section-header">
          <h2>Best selling</h2>
          <Link to="/best-selling" className="see-more">See more...</Link>
        </div>
        <div className="best-selling-grid">
          {bestSellingProducts.map(product => (
            <BestSellingProduct
              key={product.id}
              {...product}
            />
          ))}
        </div>
      </section> */}


    
      {/* Products-section with error handling and loading state */}
      <section className="products-section">
        <h2>Combo Offers</h2>
        {error ? (
          <div className="error-message">{error}</div>
        ) : (
          <div className="products-grid">
            {comboProducts.map(product => (
              <ProductPage
                key={product._id}
                image={product.image}
                title={product.name}
                price={product.price}
                rating={product.rating}
              />
            ))}
          </div>
        )}
      </section>

      

      <WhyChooseUs />
        {/* Add this after the combo offer section */}
        <section className="position-relative">
        <div className="parallax-bg py-5">
          <div className="container">
            <div className="row">
              <div className="col-md-12 py-md-5 my-md-4">
                <div className="d-flex align-items-center text-center flex-column">
                  <h3 className="text-light mb-3 fs-5">Get 20% Flat Off On Your Welcome Offer
                  </h3>
                  <h2 className="text-white fw-bold mb-5 fs-1">Exclusive Discounts</h2>
                  <a className="btn btn-primary rounded-pill px-4" href="/shop">Shop Now</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brand-section */}
      <section className="shop-by-world-brands">
        <div className="heading-bg">
          <h2>Discover Our Latest &Greatest</h2>
        </div>
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          navigation
          pagination={{ clickable: true }}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          spaceBetween={20}
          slidesPerView={4}
          breakpoints={{
            320: {
              slidesPerView: 1,
              spaceBetween: 10
            },
            480: {
              slidesPerView: 2,
              spaceBetween: 15
            },
            768: {
              slidesPerView: 3,
              spaceBetween: 20
            },
            1024: {
              slidesPerView: 5,
              spaceBetween: 25
            }
          }}
          className="brands-swiper"
        >
          <SwiperSlide>
            <div className="brand-item">
              <Link to="BrandProduct/Dlecta/3000">
                <img src="https://gnbdevcdn.s3.ap-southeast-1.amazonaws.com/+Marketing/ShopByBrandImages/Dlecta.jpg" alt="Dlecta" loading="lazy" />
              </Link>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="brand-item">
              <Link to="BrandProduct/HARIBOL/3203">
                <img src={Nuts} alt="HARIBOL" loading="lazy" />
              </Link>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="brand-item">
              <Link to="BrandProduct/Tea-Culture/4097">
                <img src="https://gnbdevcdn.s3.ap-southeast-1.amazonaws.com/+Marketing/ShopByBrandImages/Tea-culture.jpg" alt="Tea Culture of the World" loading="lazy" />
              </Link>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="brand-item">
              <Link to="BrandProduct/Dlecta/3000">
                <img src="https://gnbdevcdn.s3.ap-southeast-1.amazonaws.com/+Marketing/ShopByBrandImages/Dlecta.jpg" alt="Dlecta" loading="lazy" />
              </Link>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="brand-item">
              <Link to="BrandProduct/Dlecta/3000">
                <img src="https://gnbdevcdn.s3.ap-southeast-1.amazonaws.com/+Marketing/ShopByBrandImages/Dlecta.jpg" alt="Dlecta" loading="lazy" />
              </Link>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="brand-item">
              <Link to="BrandProduct/Dlecta/3000">
                <img src="https://gnbdevcdn.s3.ap-southeast-1.amazonaws.com/+Marketing/ShopByBrandImages/Dlecta.jpg" alt="Dlecta" loading="lazy" />
              </Link>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="brand-item">
              <Link to="BrandProduct/Dlecta/3000">
                <img src="https://gnbdevcdn.s3.ap-southeast-1.amazonaws.com/+Marketing/ShopByBrandImages/Dlecta.jpg" alt="Dlecta" loading="lazy" />
              </Link>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="brand-item">
              <Link to="BrandProduct/Dlecta/3000">
                <img src="https://gnbdevcdn.s3.ap-southeast-1.amazonaws.com/+Marketing/ShopByBrandImages/Dlecta.jpg" alt="Dlecta" loading="lazy" />
              </Link>
            </div>
            </SwiperSlide>
        </Swiper>
      </section>


      <section className="embrace-section" style={{ backgroundImage: "url('//daivikorganic.com/cdn/shop/t/2/assets/embrace_bg.png?v=177282468435249167531600792217')" }}>
        <div className="container">
          <h2 className="embrace-head">Embrace a healthy and natural lifestyle by going organic.</h2>
          <p className="embrace-content">With fast-paced lifestyle and changing food habits, it's very important to be mindful about what we eat. Looking back how our ancestors lived a happy and healthy life and making wise food choices is the way forward.</p>
          <button className="embrace-shop-btn" style={{ backgroundColor: "#fcb817" }}>
            <Link to="/collections/all">Go Organic</Link>
          </button>
        </div>
      </section>

      {/* <section className="cta-section">
        <div className="cta-content">
          <h2>Start Shopping Today</h2>
          <p>Experience the finest quality natural products</p>
          <button className="cta-button">Shop Now</button>
        </div>
      </section> */}


      <Footer />
    </div>
  );
};

export default LandingPage; 
