import React from 'react';
import './WhyChooseUs.css';
import { FaLongArrowAltRight } from 'react-icons/fa';

// Import your images
import Beauty from '../../assets/Beauty.jpg';
import herbals from '../../assets/herbals.jpg';
import herbals2 from '../../assets/herbals2.jpg';

const WhyChooseUs = () => {
  const features = [
    {
      id: 1,
      title: 'PREMIUM PRODUCTS',
      image: Beauty,
      shortDesc: 'We carefully curate a wide range of high-quality products to suit your needs.',
      details: {
        text: 'Our commitment to premium quality ensures you get the best products every time.',
        list: [
          'Carefully curated high-quality products',
          'Regular inventory updates with latest trends',
          'Products sourced from trusted manufacturers',
          'Guaranteed authenticity and reliability',
          'Wide range of product selection'
        ]
      }
    },
    {
      id: 2,
      title: 'EXCEPTIONAL SERVICE',
      image: herbals,
      shortDesc: 'Our dedicated customer support team is available 24/7 to assist you with any needs.',
      details: {
        text: 'Experience unmatched customer service with our dedicated support team.',
        list: [
          '24/7 Customer Support',
          'Fast and Secure Checkout',
          'Multiple Payment Options',
          'Hassle-free Returns',
          'Easy Exchange Policy',
          'Quick Response Time'
        ]
      }
    },
    {
      id: 3,
      title: 'UNMATCHED QUALITY',
      image: herbals2,
      shortDesc: 'Every item undergoes strict quality control to meet the highest standards.',
      details: {
        text: 'Quality is our top priority. We ensure every product meets strict standards.',
        list: [
          'Strict Quality Control',
          'Durability Guaranteed',
          'Premium Functionality',
          'Superior Design Standards',
          'Transparent Customer Reviews',
          'Quality Assurance Testing'
        ]
      }
    }
  ];

  return (
    <div className="columns_wrap_notoutside">
      <div className="bg-section section-header text-center">
        <h2>Why Choose PickNow?</h2>
        <p className="section-subtitle">
          At PickNow, we are committed to providing an unparalleled shopping experience with 
          top-notch products, excellent customer service, and unbeatable quality.
        </p>
      </div>
      
      <div className="sectionwid">
        <div className="page-width">
          <div className="full-width product-flex-container in">
            {features.map((feature) => (
              <div key={feature.id} className="organic-say-coloum medium-up--one-third text-center">
                <h3 className="h4">{feature.title}</h3>
                
                <div className="say-content-1">
                  <div className="say-organic-img">
                    <span>
                      <img src={feature.image} alt={feature.title} />
                    </span>
                  </div>
                  <p>{feature.shortDesc}</p>
                </div>
                
                <div className="hover-say">
                  <div className="rte-setting">
                    <p>{feature.details.text}</p>
                    <ul>
                      {feature.details.list.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="click-arrow">
                  <span><FaLongArrowAltRight /></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhyChooseUs; 