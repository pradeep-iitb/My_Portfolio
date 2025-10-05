import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import { useAuth } from '../../contexts/AuthContext';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated, token } = useAuth();
  const [cartItemCount, setCartItemCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  useEffect(() => {
    // Animate header on mount
    gsap.fromTo('.header-container', 
      { y: -80, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' }
    );

    // Animate logo
    gsap.fromTo('.logo', 
      { scale: 0.5, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.6, delay: 0.2, ease: 'back.out(1.7)' }
    );

    // Animate navigation items
    gsap.fromTo('.nav-item', 
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, delay: 0.3, stagger: 0.1, ease: 'power2.out' }
    );

    // Fetch cart count if user is authenticated
    if (isAuthenticated && token) {
      fetchCartCount();
    } else {
      setCartItemCount(0);
    }

    // Listen for cart updates
    const handleCartUpdate = () => {
      if (isAuthenticated && token) {
        fetchCartCount();
      }
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    
    // Cleanup
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, [isAuthenticated, token]);

  const fetchCartCount = async () => {
    try {
      const response = await fetch('/api/users/cart/summary', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success || data.itemCount !== undefined) {
        setCartItemCount(data.itemCount || 0);
      }
    } catch (error) {
      console.error('Error fetching cart count:', error);
      setCartItemCount(0);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsSearchExpanded(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    
    if (!isMenuOpen) {
      gsap.fromTo('.mobile-menu',
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
      );
    }
  };

  // Remove the old cart item count line since we're managing it in state now

  return (
    <header className="header">
      <div className="header-container">
        {/* Top header */}
        <div className="header-top">
          <div className="container-fluid">
            <div className="header-content">
              {/* Logo */}
              <Link to="/" className="logo">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" 
                  alt="Amazon"
                  className="logo-img"
                />
              </Link>

              {/* Delivery location */}
              <div className="delivery-location nav-item d-md-none">
                <div className="location-icon">
                  <i className="fas fa-map-marker-alt"></i>
                </div>
                <div className="location-text">
                  <span className="deliver-to">Deliver to</span>
                  <span className="location-name">United States</span>
                </div>
              </div>

              {/* Search bar */}
              <div className={`search-container ${isSearchExpanded ? 'expanded' : ''}`}>
                <form onSubmit={handleSearch} className="search-form">
                  <select className="search-category d-md-none">
                    <option value="all">All</option>
                    <option value="electronics">Electronics</option>
                    <option value="books">Books</option>
                    <option value="fashion">Fashion</option>
                    <option value="home">Home & Kitchen</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Search Amazon Clone"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                  />
                  <button type="submit" className="search-btn">
                    <i className="fas fa-search"></i>
                  </button>
                </form>
              </div>

              {/* Right side navigation */}
              <div className="nav-right">
                {/* Language selector */}
                <div className="nav-item language-selector d-md-none">
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/en/a/a4/Flag_of_the_United_States.svg" 
                    alt="US" 
                    className="flag-icon"
                  />
                  <span>EN</span>
                  <i className="fas fa-caret-down"></i>
                </div>

                {/* Account & Lists */}
                <div className="nav-item account-menu">
                  {isAuthenticated ? (
                    <div className="dropdown">
                      <div className="account-info">
                        <span className="greeting">Hello, {user?.firstName}</span>
                        <span className="account-label">Account & Lists</span>
                        <i className="fas fa-caret-down"></i>
                      </div>
                      <div className="dropdown-menu">
                        <div className="dropdown-section">
                          <h4>Your Account</h4>
                          <Link to="/profile" className="dropdown-link">Your Profile</Link>
                          <Link to="/orders" className="dropdown-link">Your Orders</Link>
                          <Link to="/wishlist" className="dropdown-link">Your Wish List</Link>
                        </div>
                        <div className="dropdown-divider"></div>
                        <button onClick={handleLogout} className="dropdown-link logout-btn">
                          Sign Out
                        </button>
                      </div>
                    </div>
                  ) : (
                    <Link to="/login" className="login-link">
                      <span className="greeting">Hello, sign in</span>
                      <span className="account-label">Account & Lists</span>
                    </Link>
                  )}
                </div>

                {/* Orders */}
                <Link to="/orders" className="nav-item orders d-md-none">
                  <span className="returns">Returns</span>
                  <span className="orders-label">& Orders</span>
                </Link>

                {/* Cart */}
                <Link to="/cart" className="nav-item cart">
                  <div className="cart-icon">
                    <i className="fas fa-shopping-cart"></i>
                    {cartItemCount > 0 && (
                      <span className="cart-count">{cartItemCount}</span>
                    )}
                  </div>
                  <span className="cart-label">Cart</span>
                </Link>

                {/* Mobile menu toggle */}
                <button 
                  className="mobile-menu-toggle d-md-block"
                  onClick={toggleMobileMenu}
                >
                  <i className="fas fa-bars"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary navigation */}
        <div className="header-bottom d-md-none">
          <div className="container-fluid">
            <nav className="secondary-nav">
              <button className="nav-toggle">
                <i className="fas fa-bars"></i>
                <span>All</span>
              </button>
              
              <div className="nav-links">
                <Link to="/products?category=Electronics" className="nav-link">Electronics</Link>
                <Link to="/products?category=Books" className="nav-link">Books</Link>
                <Link to="/products?category=Fashion" className="nav-link">Fashion</Link>
                <Link to="/products?category=Home & Kitchen" className="nav-link">Home & Kitchen</Link>
                <Link to="/products?category=Sports & Outdoors" className="nav-link">Sports</Link>
                <Link to="/products?featured=true" className="nav-link">Best Sellers</Link>
                <Link to="/products?new=true" className="nav-link">New Releases</Link>
                <span className="nav-link">Today's Deals</span>
              </div>
            </nav>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="mobile-menu d-md-block">
            <div className="mobile-menu-header">
              <h3>Browse Categories</h3>
              <button onClick={toggleMobileMenu} className="close-btn">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="mobile-menu-content">
              <Link to="/products?category=Electronics" onClick={toggleMobileMenu}>Electronics</Link>
              <Link to="/products?category=Books" onClick={toggleMobileMenu}>Books</Link>
              <Link to="/products?category=Fashion" onClick={toggleMobileMenu}>Fashion</Link>
              <Link to="/products?category=Home & Kitchen" onClick={toggleMobileMenu}>Home & Kitchen</Link>
              <Link to="/products?category=Sports & Outdoors" onClick={toggleMobileMenu}>Sports</Link>
              <div className="mobile-menu-divider"></div>
              {isAuthenticated ? (
                <>
                  <Link to="/profile" onClick={toggleMobileMenu}>Your Profile</Link>
                  <Link to="/orders" onClick={toggleMobileMenu}>Your Orders</Link>
                  <Link to="/wishlist" onClick={toggleMobileMenu}>Your Wishlist</Link>
                  <button onClick={handleLogout} className="mobile-logout-btn">Sign Out</button>
                </>
              ) : (
                <Link to="/login" onClick={toggleMobileMenu}>Sign In</Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;