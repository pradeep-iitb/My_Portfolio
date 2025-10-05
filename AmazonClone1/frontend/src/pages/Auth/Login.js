import React, { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import '../../styles/Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Enter your email or mobile phone number';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Enter your password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await login(formData.email, formData.password);
      navigate(from, { replace: true });
    } catch (error) {
      setErrors({
        general: error.response?.data?.message || 'Sign-in failed. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (userType) => {
    const demoCredentials = {
      customer: { email: 'customer@example.com', password: 'Password123!' },
      seller: { email: 'jane@example.com', password: 'Password123!' },
      admin: { email: 'john@example.com', password: 'Password123!' }
    };

    const credentials = demoCredentials[userType];
    setFormData(credentials);
    
    setIsLoading(true);
    try {
      await login(credentials.email, credentials.password);
      navigate(from, { replace: true });
    } catch (error) {
      setErrors({
        general: 'Demo login failed. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        {/* Amazon Logo */}
        <div className="auth-logo">
          <Link to="/">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" 
              alt="Amazon" 
              className="amazon-logo"
            />
          </Link>
        </div>

        {/* Sign-in Form */}
        <div className="auth-form-container">
          <div className="auth-form">
            <h1>Sign in</h1>
            
            {errors.general && (
              <div className="error-box">
                <div className="error-content">
                  <h4>There was a problem</h4>
                  <p>{errors.general}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label htmlFor="email">Email or mobile phone number</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? 'error' : ''}
                  autoComplete="email"
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>

              <div className="input-group">
                <label htmlFor="password">Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={errors.password ? 'error' : ''}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                {errors.password && <span className="error-text">{errors.password}</span>}
              </div>

              <button 
                type="submit" 
                className="auth-button primary"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <div className="auth-info">
              <p>
                By signing in, you agree to Amazon's{' '}
                <Link to="/conditions" className="link">Conditions of Use</Link> and{' '}
                <Link to="/privacy" className="link">Privacy Notice</Link>.
              </p>
            </div>

            <div className="auth-help">
              <details>
                <summary>Need help?</summary>
                <div className="help-content">
                  <Link to="/forgot-password" className="link">Forgot your password?</Link>
                  <Link to="/help" className="link">Other issues with Sign-In</Link>
                </div>
              </details>
            </div>
          </div>

          {/* Demo Login Section */}
          <div className="demo-section">
            <div className="divider">
              <span>Or try demo accounts</span>
            </div>
            <div className="demo-buttons">
              <button 
                onClick={() => handleDemoLogin('customer')}
                className="demo-button"
                disabled={isLoading}
              >
                Demo Customer
              </button>
              <button 
                onClick={() => handleDemoLogin('seller')}
                className="demo-button"
                disabled={isLoading}
              >
                Demo Seller
              </button>
              <button 
                onClick={() => handleDemoLogin('admin')}
                className="demo-button"
                disabled={isLoading}
              >
                Demo Admin
              </button>
            </div>
          </div>

          {/* Create Account */}
          <div className="new-customer">
            <div className="divider">
              <span>New to Amazon?</span>
            </div>
            <Link to="/register" className="auth-button secondary">
              Create your Amazon account
            </Link>
          </div>
        </div>

        {/* Footer Links */}
        <div className="auth-footer">
          <div className="footer-links">
            <Link to="/conditions">Conditions of Use</Link>
            <Link to="/privacy">Privacy Notice</Link>
            <Link to="/help">Help</Link>
          </div>
          <div className="footer-copyright">
            <p>© 1996-2024, Amazon.com, Inc. or its affiliates</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;