import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram, FaYoutube } from 'react-icons/fa';
import './footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-columns">
          <div className="footer-column">
            <div className="footer-logo">
              <h1>Picknow</h1>
            </div>
            <p className="footer-description">
              Your one-stop destination for 100% organic products. Shop natural, live healthy!
            </p>
            <div className="footer-social">
              <a href="#" className="social-icon" aria-label="Facebook"><FaFacebookF /></a>
              <a href="#" className="social-icon" aria-label="Twitter"><FaTwitter /></a>
              <a href="#" className="social-icon" aria-label="LinkedIn"><FaLinkedinIn /></a>
              <a href="#" className="social-icon" aria-label="Instagram"><FaInstagram /></a>
              <a href="#" className="social-icon" aria-label="YouTube"><FaYoutube /></a>
            </div>
          </div>

         
          <div className="footer-column">
            <h3>Become a Seller</h3>
            <ul className="footer-links">
                <li>
                    <a href="/SellerPage" target="_blank" rel="noopener noreferrer">
                        Be a Seller
                    </a>
                </li>
            </ul>
          </div>


          <div className="footer-column">
            <h3>About</h3>
            <ul className="footer-links">
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/categories">Categories</Link></li>
              <li><Link to="/deals">Deals</Link></li>
            </ul>
          </div>

            <div className="footer-column">
            <h3>Useful Links</h3>
            <ul className="footer-links">
              <li><Link to="/terms-and-conditions">Terms & Conditions</Link></li>
              <li><Link to="/PrivacyPolicy">Privacy Policy</Link></li>
              <li><Link to="/refund">Refund</Link></li>
            </ul>
            </div>
            
           
          <div className="footer-column">
            <h3>For users</h3>
            <ul className="footer-links">
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/register">Register</Link></li>
                <li><Link to="/settings">Settings</Link></li>
                <li><Link to="/orders">My Orders</Link></li>
            </ul>
            <div className="app-buttons">
              <a href="#" className="app-button">
                <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="Download on App Store" />
              </a>
              <a href="#" className="app-button">
                <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Get it on Google Play" />
              </a>
            </div>
          </div>

          
        </div>

        <div className="footer-bottom">
          <p> {currentYear} @Picknow</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;