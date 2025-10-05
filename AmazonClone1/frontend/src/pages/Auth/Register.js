import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import '../../styles/Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

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

    if (!formData.name.trim()) {
      newErrors.name = 'Enter your name';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Enter your email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Enter your password';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Re-enter your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const userData = {
        firstName: formData.name.split(' ')[0] || formData.name,
        lastName: formData.name.split(' ').slice(1).join(' ') || '',
        email: formData.email,
        password: formData.password
      };
      
      await register(userData);
      navigate('/', { replace: true });
    } catch (error) {
      setErrors({
        general: error.response?.data?.message || 'Registration failed. Please try again.'
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

        {/* Register Form */}
        <div className="auth-form-container">
          <div className="auth-form">
            <h1>Create account</h1>
            
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
                <label htmlFor="name">Your name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={errors.name ? 'error' : ''}
                  autoComplete="name"
                  placeholder="First and last name"
                />
                {errors.name && <span className="error-text">{errors.name}</span>}
              </div>

              <div className="input-group">
                <label htmlFor="email">Email</label>
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
                    autoComplete="new-password"
                    placeholder="At least 6 characters"
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

              <div className="input-group">
                <label htmlFor="confirmPassword">Re-enter password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={errors.confirmPassword ? 'error' : ''}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
              </div>

              <button 
                type="submit" 
                className="auth-button primary"
                disabled={isLoading}
              >
                {isLoading ? 'Creating account...' : 'Create your Amazon account'}
              </button>
            </form>

            <div className="auth-info">
              <p>
                By creating an account, you agree to Amazon's{' '}
                <Link to="/conditions" className="link">Conditions of Use</Link> and{' '}
                <Link to="/privacy" className="link">Privacy Notice</Link>.
              </p>
            </div>
          </div>

          {/* Password Requirements */}
          <div className="register-info">
            <h3>Password requirements</h3>
            <ul>
              <li>At least 6 characters</li>
              <li>Mix of uppercase and lowercase letters recommended</li>
              <li>At least one number recommended</li>
              <li>At least one special character recommended</li>
            </ul>
          </div>

          {/* Sign In Link */}
          <div className="divider">
            <span>Already have an account?</span>
          </div>
          <Link to="/login" className="auth-button secondary">
            Sign in
          </Link>
        </div>

        {/* Business Account */}
        <div className="new-customer">
          <div className="divider">
            <span>Buying for work?</span>
          </div>
          <Link to="/business" className="auth-button secondary">
            Create a business account
          </Link>
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

export default Register;