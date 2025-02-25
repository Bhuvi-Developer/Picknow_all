import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import CategoryNav from './components/Navbar/CategoryNav';
import LandingPage from './components/Landingpage/LandingPage';
import Login from './components/Login/login';
import ProductPage from './components/ProductPage/ProductPage';
import CartPage from './components/CartPage/CartPage';
import UserProfile from './components/UserProfile/UserProfile';
import ProductDetail from './components/ProductPage/ProductDetail';
import CategoryPage from './components/CategoryPage/CategoryPage';
import DealsPage from './components/DealsPage/DealsPage';
import PaymentPage from './components/PaymentPage/PaymentPage';
import CategoryProducts from './components/CategoryPage/CategoryProducts';
import TermsAndConditions from './components/Footer/TermsAndConditions/TermsAndConditions';
import PrivacyPolicy from './components/Footer/PrivacyPolicy/PrivacyPolicy';
import Refund from './components/Footer/refund';
import SellerPage from './components/SellerPage/SellerPage';
import SellerLogin from './components/SellerPage/SellerLogin/SellerLogin';
import WhyChooseUs from './components/WhyChooseUs/WhyChooseUs';
import SellerDashboard from './components/SellerDashboard/SellerDashboard'
import VendorRegistration from './components/VendorRegistration/VendorRegistration';



const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (status) => {
    setIsLoggedIn(status);
    if (!status) {
      localStorage.removeItem('currentUser');
      navigate('/');
    }
    // Dispatch event to notify other components
    window.dispatchEvent(new Event('loginStateChanged'));
  };

  // Function to check if navbar should be hidden
  const shouldHideNavbar = () => {
    return location.pathname === '/SellerPage' || 
           location.pathname === '/SellerLogin';
  };

  return (
    <div className="app">
      {!shouldHideNavbar() && <Navbar isLoggedIn={isLoggedIn} onLogout={() => handleLogin(false)} />}
      <div className="main-content">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/product" element={<ProductPage />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/categories" element={<CategoryPage />} />
          <Route path="/category/:id" element={<CategoryProducts />} />
          <Route path="/deals" element={<DealsPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/refund" element={<Refund />} />
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
          <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
          <Route path="/SellerLogin" element={<SellerLogin />} />
          <Route path="/SellerPage" element={<SellerPage />} />
          <Route path="/WhyChooseUs" element={<WhyChooseUs />} />
          <Route path="SellerDashboard" element={<SellerDashboard />} />
          <Route path="/vendor/register" element={<VendorRegistration />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;

