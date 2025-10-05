import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import './OrderSuccess.css';

const OrderSuccess = () => {
  const location = useLocation();
  const orderData = location.state?.orderData;

  useEffect(() => {
    // Animate success elements
    gsap.fromTo('.success-icon', 
      { scale: 0, rotate: -180 },
      { scale: 1, rotate: 0, duration: 0.8, ease: 'back.out(1.7)' }
    );

    gsap.fromTo('.success-content', 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6, delay: 0.3, ease: 'power2.out' }
    );

    // Trigger cart update event to refresh header
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  }, []);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="order-success-container">
      <div className="success-header">
        <Link to="/" className="amazon-logo">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" 
            alt="Amazon"
          />
        </Link>
      </div>

      <div className="success-content">
        <div className="success-icon">
          <i className="fas fa-check-circle"></i>
        </div>

        <h1>Order placed successfully!</h1>
        <p className="success-message">
          Thank you for your order. Your items will be shipped to your address soon.
        </p>

        {orderData && (
          <div className="order-details">
            <div className="order-summary-box">
              <h2>Order Summary</h2>
              
              <div className="order-info">
                <div className="info-row">
                  <span>Order ID:</span>
                  <span>#{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                </div>
                <div className="info-row">
                  <span>Order Date:</span>
                  <span>{formatDate(new Date())}</span>
                </div>
                <div className="info-row">
                  <span>Estimated Delivery:</span>
                  <span>{formatDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))}</span>
                </div>
                <div className="info-row">
                  <span>Total Amount:</span>
                  <span className="total-amount">${orderData.summary.totalPrice}</span>
                </div>
              </div>

              <div className="shipping-address">
                <h3>Shipping Address</h3>
                <div className="address">
                  <p><strong>{orderData.address.firstName} {orderData.address.lastName}</strong></p>
                  <p>{orderData.address.addressLine1}</p>
                  {orderData.address.addressLine2 && <p>{orderData.address.addressLine2}</p>}
                  <p>{orderData.address.city}, {orderData.address.state} {orderData.address.zipCode}</p>
                  <p>{orderData.address.country}</p>
                </div>
              </div>

              <div className="ordered-items">
                <h3>Items Ordered ({orderData.items.length})</h3>
                <div className="items-list">
                  {orderData.items.map((item) => (
                    <div key={item.product._id} className="order-item">
                      <img
                        src={item.product.images?.[0]?.url || '/placeholder-product.jpg'}
                        alt={item.product.title}
                      />
                      <div className="item-info">
                        <h4>{item.product.title}</h4>
                        <p>Quantity: {item.quantity}</p>
                        <span className="item-price">${(item.product.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="success-actions">
          <Link to="/orders" className="view-orders-btn">
            View Your Orders
          </Link>
          <Link to="/" className="continue-shopping-btn">
            Continue Shopping
          </Link>
        </div>

        <div className="next-steps">
          <h3>What happens next?</h3>
          <div className="steps">
            <div className="step">
              <div className="step-icon">
                <i className="fas fa-box"></i>
              </div>
              <div className="step-content">
                <h4>Order Processing</h4>
                <p>We'll prepare your items for shipping</p>
              </div>
            </div>
            <div className="step">
              <div className="step-icon">
                <i className="fas fa-shipping-fast"></i>
              </div>
              <div className="step-content">
                <h4>Shipping</h4>
                <p>Your order will be on its way</p>
              </div>
            </div>
            <div className="step">
              <div className="step-icon">
                <i className="fas fa-home"></i>
              </div>
              <div className="step-content">
                <h4>Delivery</h4>
                <p>Enjoy your new items!</p>
              </div>
            </div>
          </div>
        </div>

        <div className="support-info">
          <p>Questions about your order? <Link to="/contact">Contact our customer service</Link></p>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;