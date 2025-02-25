import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import './Carousel.css';
import dryfruits from '../../assets/dryfruits.jpg';
import Nuts from '../../assets/Nuts.jpg';
import honey from '../../assets/honey.jpg';

const carouselData = [
  {
    id: 1,
    image: {
      src:dryfruits,
      alt: "Organic Products Showcase",
      aspectRatio: "1.7777777777777777"
    },
    title: "Premium Dry Fruits",
    description: "Experience the finest quality natural and organic products",
  },
  {
    id: 2,
    image: {
      src: Nuts,
      alt: "Fresh Organic Collection",
      aspectRatio: "1.7777777777777777"
    },
    title: "Fresh & Natural",
    description: "Discover our wide range of fresh and natural products",
  },
  {
    id: 3,
    image: {
      src: honey,
      alt: "Premium Quality Products",
      aspectRatio: "1.7777777777777777"
    },
    title: "Pure Honey",
    description: "Shop premium quality organic products for a healthy lifestyle",
  }
];

const Carousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [exitingSlide, setExitingSlide] = useState(null);

  const nextSlide = () => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setExitingSlide(currentSlide);
      setCurrentSlide((prev) => (prev + 1) % carouselData.length);
    }
  };

  const prevSlide = () => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setExitingSlide(currentSlide);
      setCurrentSlide((prev) => (prev - 1 + carouselData.length) % carouselData.length);
    }
  };

  const goToSlide = (index) => {
    if (!isTransitioning && index !== currentSlide) {
      setIsTransitioning(true);
      setExitingSlide(currentSlide);
      setCurrentSlide(index);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTransitioning(false);
      setExitingSlide(null);
    }, 700);

    return () => clearTimeout(timer);
  }, [currentSlide]);

  useEffect(() => {
    const autoPlayTimer = setInterval(nextSlide, 5000);
    return () => clearInterval(autoPlayTimer);
  }, [currentSlide, isTransitioning]);

  return (
    <div className="carousel-container">
      {carouselData.map((slide, index) => (
        <div
          key={slide.id}
          className={`carousel-slide ${
            index === currentSlide ? 'active' : ''
          } ${index === exitingSlide ? 'exit' : ''}`}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: index === currentSlide ? 1 : 0,
            visibility: index === currentSlide || index === exitingSlide ? 'visible' : 'hidden'
          }}
        >
          <div className="carousel-image-wrapper">
            <img
              src={slide.image.src}
              alt={slide.image.alt}
              className="carousel-image"
            />
          </div>
          <div className="carousel-overlay"></div>
          <div className="carousel-content">
            <h2 className="carousel-title">{slide.title}</h2>
            <p className="carousel-description">{slide.description}</p>
          </div>
        </div>
      ))}

      <div className="carousel-nav">
        <button onClick={prevSlide} aria-label="Previous slide">
          <FaChevronLeft />
        </button>
        <button onClick={nextSlide} aria-label="Next slide">
          <FaChevronRight />
        </button>
      </div>

      <div className="carousel-dots">
        {carouselData.map((_, index) => (
          <button
            key={index}
            className={`carousel-dot ${index === currentSlide ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;
