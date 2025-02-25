import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import CartIcon from './CartIcon';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');

  // Check login status on component mount and token changes
  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      if (token && user) {
        setIsLoggedIn(true);
        setUsername(JSON.parse(user).name || '');
      } else {
        setIsLoggedIn(false);
        setUsername('');
      }
    };

    checkLoginStatus();

    // Listen for storage events (for cross-tab synchronization)
    window.addEventListener('storage', checkLoginStatus);
    
    // Custom event listener for login updates
    window.addEventListener('loginStateChanged', checkLoginStatus);

    return () => {
      window.removeEventListener('storage', checkLoginStatus);
      window.removeEventListener('loginStateChanged', checkLoginStatus);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUsername('');
    navigate('/');
    
    // Dispatch event to notify other components
    window.dispatchEvent(new Event('loginStateChanged'));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (isSearchOpen) setIsSearchOpen(false);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="header">
      <nav className="navbar">
        <div className="nav-left">
          <div className="nav-brand">
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>PickNow</Link>
          </div>
          
          <div className={`nav-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
            <Link 
              to="/product" 
              className={location.pathname.includes('/product') ? 'active' : ''}
              onClick={() => handleNavigation('/product')}
            >
              Products
            </Link>
            <Link 
              to="/categories" 
              className={location.pathname === '/categories' ? 'active' : ''}
              onClick={() => handleNavigation('/categories')}
            >
              Categories
            </Link>
            <Link 
              to="/deals" 
              className={location.pathname === '/deals' ? 'active' : ''}
              onClick={() => handleNavigation('/deals')}
            >
              Deals
            </Link>
          </div>
        </div>

        <div className="nav-right">
          <div className="nav-search">
            <button 
              className="search-icon"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
            <div className={`search-container ${isSearchOpen ? 'open' : ''}`}>
              <form onSubmit={handleSearch}>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {/* <button type="submit">Search</button> */}
              </form>
            </div>
          </div>

          <div className="nav-auth">
            {isLoggedIn ? (
              <>
                <span className="welcome-text">Welcome, {username}!</span>
                <CartIcon />
                <Link 
                  to="/Profile" 
                  className="nav-icon-link"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </Link>
                <button className="logout-btn" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <Link 
                to="/login" 
                className="Login-btn"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </div>

          <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
            <div className={`menu-icon ${isMobileMenuOpen ? 'open' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Navbar; 
