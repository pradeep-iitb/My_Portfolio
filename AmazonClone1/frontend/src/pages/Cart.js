import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import './Cart.css';

const Cart = () => {
  const { user, token } = useContext(AuthContext);
  const [cartData, setCartData] = useState({ items: [], summary: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchCartItems();
  }, [user, navigate]);

  const fetchCartItems = async () => {
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
      } else {
        setError(data.message || 'Failed to fetch cart items');
      }
    } catch (error) {
      setError('Error loading cart');
      console.error('Cart fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      const response = await fetch(`/api/users/cart/${productId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantity: newQuantity })
      });

      const data = await response.json();
      if (data.success) {
        fetchCartItems(); // Refresh cart data
      } else {
        setError(data.message || 'Failed to update quantity');
      }
    } catch (error) {
      setError('Error updating quantity');
      console.error('Update quantity error:', error);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const response = await fetch(`/api/users/cart/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        fetchCartItems(); // Refresh cart data
      } else {
        setError(data.message || 'Failed to remove item');
      }
    } catch (error) {
      setError('Error removing item');
      console.error('Remove item error:', error);
    }
  };

  const clearCart = async () => {
    try {
      const response = await fetch('/api/users/cart', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setCartData({ items: [], summary: {} });
      } else {
        setError(data.message || 'Failed to clear cart');
      }
    } catch (error) {
      setError('Error clearing cart');
      console.error('Clear cart error:', error);
    }
  };

  if (loading) {
    return (
      <div className="cart-container">
        <div className="cart-loading">
          <div className="spinner"></div>
          <p>Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="cart-container">
        <div className="cart-empty">
          <img 
            src="https://m.media-amazon.com/images/G/01/cart/empty/kettle-desaturated._CB445243794_.svg" 
            alt="Empty cart" 
            className="empty-cart-image"
          />
          <h2>Your Amazon Cart is empty</h2>
          <p>
            <Link to="/login">Sign in to your account</Link> to see if you have any saved items.
          </p>
          <Link to="/" className="shop-today-btn">
            Shop today's deals
          </Link>
        </div>
      </div>
    );
  }

  if (!cartData.items || cartData.items.length === 0) {
    return (
      <div className="cart-container">
        <div className="cart-empty">
          <img 
            src="https://m.media-amazon.com/images/G/01/cart/empty/kettle-desaturated._CB445243794_.svg" 
            alt="Empty cart" 
            className="empty-cart-image"
          />
          <h2>Your Amazon Cart is empty</h2>
          <p>Check your Saved for later items below or <Link to="/">continue shopping</Link>.</p>
          <Link to="/" className="shop-today-btn">
            Shop today's deals
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="cart-content">
        <div className="cart-main">
          <div className="cart-header">
            <h1>Shopping Cart</h1>
            <button onClick={clearCart} className="clear-cart-btn">
              Clear Cart
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="cart-items">
            {cartData.items.map((item) => (
              <div key={item.product._id} className="cart-item">
                <div className="item-image">
                  <img
                    src={item.product.images?.[0]?.url || '/placeholder-product.jpg'}
                    alt={item.product.title}
                  />
                </div>

                <div className="item-details">
                  <h3 className="item-title">
                    <Link to={`/products/${item.product._id}`}>
                      {item.product.title}
                    </Link>
                  </h3>
                  
                  <div className="item-meta">
                    <span className="in-stock">In Stock</span>
                    {item.product.primeEligible && (
                      <span className="prime-badge">
                        <img 
                          src="https://m.media-amazon.com/images/G/01/marketing/prime/detail_page/prime_logo_51x15._CB445956655_.png" 
                          alt="Prime" 
                        />
                      </span>
                    )}
                  </div>

                  <div className="item-actions">
                    <div className="quantity-controls">
                      <label htmlFor={`qty-${item.product._id}`}>Qty:</label>
                      <select
                        id={`qty-${item.product._id}`}
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.product._id, parseInt(e.target.value))}
                        className="quantity-select"
                      >
                        {[...Array(Math.min(10, item.product.stock || 10))].map((_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {i + 1}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product._id)}
                      className="remove-btn"
                    >
                      Delete
                    </button>

                    <button className="save-later-btn">
                      Save for later
                    </button>

                    <button className="compare-btn">
                      Compare with similar items
                    </button>
                  </div>
                </div>

                <div className="item-price">
                  <span className="price">${item.product.price.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary-mobile">
            <div className="subtotal">
              Subtotal ({cartData.summary.totalItems || 0} items): 
              <span className="price">${cartData.summary.itemsPrice || '0.00'}</span>
            </div>
          </div>
        </div>

        <div className="cart-sidebar">
          <div className="order-summary">
            <div className="free-shipping-banner">
              {cartData.summary.shippingPrice === 0 ? (
                <div className="free-shipping-eligible">
                  <i className="checkmark">✓</i>
                  Your order qualifies for FREE Shipping
                </div>
              ) : (
                <div className="shipping-promo">
                  Add ${(35 - (cartData.summary.itemsPrice || 0)).toFixed(2)} of eligible items to your order to qualify for FREE Shipping
                </div>
              )}
            </div>

            <div className="subtotal">
              Subtotal ({cartData.summary.totalItems || 0} items): 
              <span className="price">${cartData.summary.itemsPrice || '0.00'}</span>
            </div>

            <div className="gift-option">
              <input type="checkbox" id="gift" />
              <label htmlFor="gift">This order contains a gift</label>
            </div>

            <Link to="/checkout" className="proceed-checkout-btn">
              Proceed to checkout
            </Link>

            <div className="order-details">
              <div className="order-line">
                <span>Items ({cartData.summary.totalItems || 0}):</span>
                <span>${cartData.summary.itemsPrice || '0.00'}</span>
              </div>
              <div className="order-line">
                <span>Shipping & handling:</span>
                <span>${cartData.summary.shippingPrice || '0.00'}</span>
              </div>
              <div className="order-line">
                <span>Total before tax:</span>
                <span>${((cartData.summary.itemsPrice || 0) + (cartData.summary.shippingPrice || 0)).toFixed(2)}</span>
              </div>
              <div className="order-line">
                <span>Estimated tax:</span>
                <span>${cartData.summary.taxPrice || '0.00'}</span>
              </div>
              <div className="order-line total">
                <span>Order total:</span>
                <span>${cartData.summary.totalPrice || '0.00'}</span>
              </div>
            </div>

            <div className="payment-options">
              <p>How would you like to pay?</p>
              <div className="payment-method">
                <input type="radio" id="credit-card" name="payment" defaultChecked />
                <label htmlFor="credit-card">Credit or debit card</label>
              </div>
              <div className="payment-method">
                <input type="radio" id="amazon-pay" name="payment" />
                <label htmlFor="amazon-pay">Amazon Pay</label>
              </div>
            </div>
          </div>

          <div className="recommended-products">
            <h3>Customers who bought items in your cart also bought</h3>
            <div className="recommended-item">
              <img 
                src="https://m.media-amazon.com/images/I/51Zymoq7UnL._AC_SX250_.jpg" 
                alt="Recommended product" 
              />
              <div className="recommended-details">
                <p>Apple Lightning to USB Cable (1 m)</p>
                <span className="recommended-price">$19.99</span>
                <button className="add-to-cart-btn">Add to Cart</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;