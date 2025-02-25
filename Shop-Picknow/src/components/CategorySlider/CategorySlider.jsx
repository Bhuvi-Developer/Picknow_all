import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import './CategorySlider.css';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/autoplay';
import { CategoryShimmer } from '../ShimmerEffect/ShimmerEffect';

// Import existing images from your assets folder
import dryFruit1 from '../../assets/dryfruits.jpg';
import Nuts from '../../assets/Nuts.jpg';
import beverage from '../../assets/Top_category_images/beverage.png';
import vegetable from '../../assets/Top_category_images/vegetable.png';
import honey from '../../assets/Top_category_images/honey.png';
import Oil from '../../assets/Top_category_images/Oil.png';

const CategoryCarousel = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    });
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <CategoryShimmer />;
  }

  const categories = [
    { id: 1, image: beverage, title: 'Staples', items: '40 items', link: '/collections/staples', bgcolor: '#f2fce4' },
    { id: 2, image: Oil, title: 'Oils', items: '10 items', link: '/collections/oils', bgcolor: '#fffceb' },
    { id: 3, image: dryFruit1, title: 'Seeds', items: '11 items', link: '/collections/seeds', bgcolor: '#ecffec' },
    { id: 4, image: honey, title: 'Honey', items: '13 items', link: '/collections/honey', bgcolor: '#feefea' },
    { id: 5, image: vegetable, title: 'Fruits & Vegetables', items: '78 items', link: '/collections/fruits-vegetables', bgcolor: '#fff3eb' },
    { id: 6, image: beverage, title: 'Beverages', items: '7 items', link: '/collections/beverages', bgcolor: '#fff3ff' }
  ];

  return (
    <div className="category-carousel-container">
      <div className="category-carousel-wrapper">
        <div className="category-carousel-header">
          <h3 className="category-carousel-title">Top Categories</h3>
          <div className="category-carousel-controls">
            <div className="category-carousel-button-prev">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                <path d="M13.3708 5.40378H3.37079L6.66379 2.11078L5.24979 0.696777L0.956789 4.98978C0.581846 5.36483 0.371216 5.87345 0.371216 6.40378C0.371216 6.93411 0.581846 7.44272 0.956789 7.81778L5.24979 12.1108L6.66379 10.6968L3.37079 7.40378H13.3708V5.40378Z" />
              </svg>
            </div>
            <div className="category-carousel-button-next">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="currentColor">
                <path d="M12.414 5.18314L8.121 0.890137L6.707 2.30414L10 5.59714H0V7.59714H10L6.707 10.8901L8.121 12.3041L12.414 8.01114C12.7889 7.63608 12.9996 7.12746 12.9996 6.59714C12.9996 6.06681 12.7889 5.55819 12.414 5.18314Z" />
              </svg>
            </div>
          </div>
        </div>
        <Swiper
          modules={[Navigation, Autoplay]}
          navigation={{
            prevEl: '.category-carousel-button-prev',
            nextEl: '.category-carousel-button-next'
          }}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true
          }}
          loop={true}
          spaceBetween={24}
          slidesPerView="auto"
          className="category-carousel-grid"
        >
          {categories.map((category) => (
            <SwiperSlide key={category.id}>
              <div className="category-carousel-item" style={{ '--item-bgcolor': category.bgcolor }}>
                <Link to={category.link} className="category-carousel-link">
                  <div className="category-carousel-image">
                    <img src={category.image} alt={category.title} loading="lazy" width="80" height="80" />
                  </div>
                  <h3 className="category-carousel-heading">{category.title}</h3>
                  <span className="category-carousel-subtitle">{category.items}</span>
                </Link>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default CategoryCarousel;
