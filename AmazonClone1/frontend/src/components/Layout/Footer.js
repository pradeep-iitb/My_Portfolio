import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer">
      {/* Back to top */}
      <div className="back-to-top" onClick={scrollToTop}>
        Back to top
      </div>

      {/* Main footer content */}
      <div className="footer-content">
        <div className="container">
          <div className="footer-sections">
            <div className="footer-section">
              <h4>Get to Know Us</h4>
              <ul>
                <li><a href="#">Careers</a></li>
                <li><a href="#">Blog</a></li>
                <li><a href="#">About Amazon</a></li>
                <li><a href="#">Investor Relations</a></li>
                <li><a href="#">Amazon Devices</a></li>
                <li><a href="#">Amazon Science</a></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>Make Money with Us</h4>
              <ul>
                <li><a href="#">Sell products on Amazon</a></li>
                <li><a href="#">Sell on Amazon Business</a></li>
                <li><a href="#">Sell apps on Amazon</a></li>
                <li><a href="#">Become an Affiliate</a></li>
                <li><a href="#">Advertise Your Products</a></li>
                <li><a href="#">Self-Publish with Us</a></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>Amazon Payment Products</h4>
              <ul>
                <li><a href="#">Amazon Business Card</a></li>
                <li><a href="#">Shop with Points</a></li>
                <li><a href="#">Reload Your Balance</a></li>
                <li><a href="#">Amazon Currency Converter</a></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>Let Us Help You</h4>
              <ul>
                <li><a href="#">Amazon and COVID-19</a></li>
                <li><Link to="/profile">Your Account</Link></li>
                <li><Link to="/orders">Your Orders</Link></li>
                <li><a href="#">Shipping Rates & Policies</a></li>
                <li><a href="#">Returns & Replacements</a></li>
                <li><a href="#">Manage Your Content and Devices</a></li>
                <li><a href="#">Amazon Assistant</a></li>
                <li><a href="#">Help</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer bottom */}
      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-content">
            {/* Logo */}
            <div className="footer-logo">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" 
                alt="Amazon"
              />
            </div>

            {/* Language and country */}
            <div className="footer-options">
              <div className="footer-option">
                <i className="fas fa-globe"></i>
                <span>English</span>
              </div>
              <div className="footer-option">
                <span>$ USD - U.S. Dollar</span>
              </div>
              <div className="footer-option">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/en/a/a4/Flag_of_the_United_States.svg" 
                  alt="US"
                  className="flag-icon"
                />
                <span>United States</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="footer-copyright">
        <div className="container">
          <div className="copyright-content">
            <div className="copyright-links">
              <a href="#">Conditions of Use</a>
              <a href="#">Privacy Notice</a>
              <a href="#">Interest-Based Ads</a>
            </div>
            <div className="copyright-text">
              © 1996-2024, Amazon Clone, Inc. or its affiliates
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;