import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import './Checkout.css';

const Checkout = () => {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [cartData, setCartData] = useState({ items: [], summary: {} });
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('credit-card');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchCartData();
    setSelectedAddress(user.addresses?.find(addr => addr.isDefault) || user.addresses?.[0]);
  }, [user, navigate]);

  const fetchCartData = async () => {
    try {
      const response = await fetch('/api/users/cart', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setCartData(data.cart);
        // If cart is empty, redirect to cart page
        if (!data.cart.items || data.cart.items.length === 0) {
          navigate('/cart');
        }
      } else {
        setError(data.message || 'Failed to fetch cart data');
      }
    } catch (error) {
      setError('Error loading cart data');
      console.error('Checkout fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCardInputChange = (field, value) => {
    let formattedValue = value;
    
    if (field === 'number') {
      // Format card number with spaces
      formattedValue = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
      if (formattedValue.length > 19) return; // Limit to 16 digits + 3 spaces
    } else if (field === 'expiry') {
      // Format expiry as MM/YY
      formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
      if (formattedValue.length > 5) return;
    } else if (field === 'cvv') {
      // Limit CVV to 4 digits
      formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length > 4) return;
    }

    setCardDetails(prev => ({
      ...prev,
      [field]: formattedValue
    }));
  };

  const validateCardDetails = () => {
    const { number, expiry, cvv, name } = cardDetails;
    
    if (!name.trim()) return 'Cardholder name is required';
    if (!number.replace(/\s/g, '') || number.replace(/\s/g, '').length < 13) return 'Please enter a valid card number';
    if (!expiry || expiry.length !== 5) return 'Please enter a valid expiry date (MM/YY)';
    if (!cvv || cvv.length < 3) return 'Please enter a valid CVV';
    
    // Check expiry date
    const [month, year] = expiry.split('/');
    const now = new Date();
    const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
    if (expiryDate < now) return 'Card has expired';
    
    return null;
  };

  const handlePlaceOrder = async () => {
    setError('');
    
    if (!selectedAddress) {
      setError('Please select a delivery address');
      return;
    }

    if (paymentMethod === 'credit-card') {
      const cardError = validateCardDetails();
      if (cardError) {
        setError(cardError);
        return;
      }
    }

    setProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In a real app, you would process payment here
      const orderData = {
        items: cartData.items,
        address: selectedAddress,
        paymentMethod,
        summary: cartData.summary
      };

      // For demo purposes, just show success and clear cart
      await fetch('/api/users/cart', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Redirect to success page
      navigate('/order-success', { 
        state: { orderData } 
      });

    } catch (error) {
      setError('Payment processing failed. Please try again.');
      console.error('Order placement error:', error);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="checkout-container">
        <div className="checkout-loading">
          <div className="spinner"></div>
          <p>Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (!cartData.items || cartData.items.length === 0) {
    return (
      <div className="checkout-container">
        <div className="checkout-empty">
          <h2>Your cart is empty</h2>
          <p>Add some items to your cart before proceeding to checkout.</p>
          <Link to="/" className="continue-shopping-btn">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <Link to="/" className="amazon-logo">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" 
            alt="Amazon"
          />
        </Link>
        <h1>Checkout</h1>
        <div className="secure-badge">
          <i className="fas fa-lock"></i>
          <span>Secure checkout</span>
        </div>
      </div>

      <div className="checkout-content">
        <div className="checkout-main">
          {/* Shipping Address */}
          <div className="checkout-section">
            <div className="section-header">
              <h2>1. Shipping address</h2>
            </div>
            <div className="address-selection">
              {user.addresses && user.addresses.length > 0 ? (
                user.addresses.map((address, index) => (
                  <div key={index} className={`address-option ${selectedAddress === address ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      id={`address-${index}`}
                      name="address"
                      checked={selectedAddress === address}
                      onChange={() => setSelectedAddress(address)}
                    />
                    <label htmlFor={`address-${index}`} className="address-card">
                      <div className="address-info">
                        <strong>{address.firstName} {address.lastName}</strong>
                        <p>{address.addressLine1}</p>
                        {address.addressLine2 && <p>{address.addressLine2}</p>}
                        <p>{address.city}, {address.state} {address.zipCode}</p>
                        <p>{address.country}</p>
                      </div>
                      {address.isDefault && <span className="default-badge">Default</span>}
                    </label>
                  </div>
                ))
              ) : (
                <div className="no-address">
                  <p>No saved addresses found.</p>
                  <Link to="/profile" className="add-address-btn">Add New Address</Link>
                </div>
              )}
            </div>
          </div>

          {/* Payment Method */}
          <div className="checkout-section">
            <div className="section-header">
              <h2>2. Payment method</h2>
            </div>
            <div className="payment-methods">
              <div className="payment-option">
                <input
                  type="radio"
                  id="credit-card"
                  name="payment"
                  value="credit-card"
                  checked={paymentMethod === 'credit-card'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <label htmlFor="credit-card">Credit or debit card</label>
              </div>
              
              {paymentMethod === 'credit-card' && (
                <div className="card-details">
                  <div className="card-input-group">
                    <label htmlFor="card-number">Card number</label>
                    <input
                      type="text"
                      id="card-number"
                      placeholder="1234 5678 9012 3456"
                      value={cardDetails.number}
                      onChange={(e) => handleCardInputChange('number', e.target.value)}
                    />
                  </div>
                  <div className="card-row">
                    <div className="card-input-group">
                      <label htmlFor="card-expiry">Expiry date</label>
                      <input
                        type="text"
                        id="card-expiry"
                        placeholder="MM/YY"
                        value={cardDetails.expiry}
                        onChange={(e) => handleCardInputChange('expiry', e.target.value)}
                      />
                    </div>
                    <div className="card-input-group">
                      <label htmlFor="card-cvv">CVV</label>
                      <input
                        type="text"
                        id="card-cvv"
                        placeholder="123"
                        value={cardDetails.cvv}
                        onChange={(e) => handleCardInputChange('cvv', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="card-input-group">
                    <label htmlFor="card-name">Name on card</label>
                    <input
                      type="text"
                      id="card-name"
                      placeholder="John Doe"
                      value={cardDetails.name}
                      onChange={(e) => handleCardInputChange('name', e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="payment-option">
                <input
                  type="radio"
                  id="amazon-pay"
                  name="payment"
                  value="amazon-pay"
                  checked={paymentMethod === 'amazon-pay'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <label htmlFor="amazon-pay">Amazon Pay</label>
              </div>

              <div className="payment-option">
                <input
                  type="radio"
                  id="paypal"
                  name="payment"
                  value="paypal"
                  checked={paymentMethod === 'paypal'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <label htmlFor="paypal">PayPal</label>
              </div>
            </div>
          </div>

          {/* Review Order */}
          <div className="checkout-section">
            <div className="section-header">
              <h2>3. Review your order</h2>
            </div>
            <div className="order-items">
              {cartData.items.map((item) => (
                <div key={item.product._id} className="order-item">
                  <img
                    src={item.product.images?.[0]?.url || '/placeholder-product.jpg'}
                    alt={item.product.title}
                  />
                  <div className="item-details">
                    <h4>{item.product.title}</h4>
                    <p>Quantity: {item.quantity}</p>
                    <span className="item-price">${item.product.price.toFixed(2)} each</span>
                  </div>
                  <div className="item-total">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}
        </div>

        {/* Order Summary Sidebar */}
        <div className="checkout-sidebar">
          <div className="order-summary">
            <h3>Order Summary</h3>
            
            <div className="summary-line">
              <span>Items ({cartData.summary.totalItems || 0}):</span>
              <span>${cartData.summary.itemsPrice || '0.00'}</span>
            </div>
            
            <div className="summary-line">
              <span>Shipping & handling:</span>
              <span>${cartData.summary.shippingPrice || '0.00'}</span>
            </div>
            
            <div className="summary-line">
              <span>Total before tax:</span>
              <span>${((cartData.summary.itemsPrice || 0) + (cartData.summary.shippingPrice || 0)).toFixed(2)}</span>
            </div>
            
            <div className="summary-line">
              <span>Estimated tax:</span>
              <span>${cartData.summary.taxPrice || '0.00'}</span>
            </div>
            
            <div className="summary-line total">
              <span>Order total:</span>
              <span>${cartData.summary.totalPrice || '0.00'}</span>
            </div>

            <button 
              className="place-order-btn"
              onClick={handlePlaceOrder}
              disabled={processing}
            >
              {processing ? (
                <>
                  <div className="btn-spinner"></div>
                  Processing...
                </>
              ) : (
                `Place your order - $${cartData.summary.totalPrice || '0.00'}`
              )}
            </button>

            <div className="order-info">
              <p>By placing your order, you agree to Amazon Clone's privacy notice and conditions of use.</p>
            </div>
          </div>

          <div className="security-info">
            <h4>Secure transaction</h4>
            <div className="security-badges">
              <img src="https://images-na.ssl-images-amazon.com/images/G/01/x-locale/checkout/truespc/secured-ssl._CB485936932_.png" alt="Secured SSL" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;