import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { AuthContext } from '../contexts/AuthContext';
import './Home.css';

const Home = () => {
  const { user, token } = useContext(AuthContext);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const heroSlides = [
    {
      id: 1,
      image: 'https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Fuji/2021/September/DashboardCards/Fuji_Dash_SmartWatch_1X._SY304_CB639922137_.jpg',
      title: 'Latest Smart Watches',
      subtitle: 'Stay connected with the newest smartwatch technology',
      cta: 'Shop now',
      link: '/products?category=Electronics&subcategory=Smart%20Watches'
    },
    {
      id: 2,
      image: 'https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Fuji/2020/May/Dashboard/Fuji_Dash_PC_1x._SY304_CB431800965_.jpg',
      title: 'Work From Home Essentials',
      subtitle: 'Everything you need for a productive home office',
      cta: 'Explore',
      link: '/products?category=Electronics&subcategory=Computers'
    },
    {
      id: 3,
      image: 'https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Fuji/2021/September/DashboardCards/Fuji_Dash_Fitness_1X._SY304_CB639922137_.jpg',
      title: 'Fitness & Health',
      subtitle: 'Get fit with our range of fitness equipment and supplements',
      cta: 'Get started',
      link: '/products?category=Sports%20%26%20Outdoors'
    },
    {
      id: 4,
      image: 'https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Fuji/2020/May/Dashboard/Fuji_Dash_Beauty_1x._SY304_CB432774351_.jpg',
      title: 'Beauty & Personal Care',
      subtitle: 'Discover the latest in beauty and skincare',
      cta: 'Shop beauty',
      link: '/products?category=Beauty%20%26%20Personal%20Care'
    },
    {
      id: 5,
      image: 'https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Fuji/2021/September/DashboardCards/Fuji_Dash_HomeImprovement_1X._SY304_CB639922137_.jpg',
      title: 'Home Improvement',
      subtitle: 'Transform your space with our home improvement products',
      cta: 'Start improving',
      link: '/products?category=Tools%20%26%20Home%20Improvement'
    }
  ];

  const categories = [
    {
      title: 'Electronics',
      image: 'https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Fuji/2020/May/Dashboard/Fuji_Dash_Electronics_1x._SY304_CB432774322_.jpg',
      items: ['Shop all Electronics', 'Laptops & Computers', 'Smart Phones', 'Audio & Headphones'],
      link: '/products?category=Electronics'
    },
    {
      title: 'Fashion',
      image: 'https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Fuji/2020/May/Dashboard/Fuji_Dash_Clothing_1x._SY304_CB431754321_.jpg',
      items: ['Shop all Fashion', 'Men\'s Clothing', 'Women\'s Clothing', 'Shoes & Accessories'],
      link: '/products?category=Fashion'
    },
    {
      title: 'Home & Kitchen',
      image: 'https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Fuji/2020/May/Dashboard/Fuji_Dash_HomeFurniture_1x._SY304_CB431754331_.jpg',
      items: ['Shop all Home', 'Kitchen & Dining', 'Furniture', 'Home Decor'],
      link: '/products?category=Home%20%26%20Kitchen'
    },
    {
      title: 'Books',
      image: 'https://images-na.ssl-images-amazon.com/images/G/01/AmazonExports/Fuji/2020/May/Dashboard/Fuji_Dash_Books_1x._SY304_CB431754321_.jpg',
      items: ['Shop all Books', 'Best Sellers', 'New Releases', 'Kindle eBooks'],
      link: '/products?category=Books'
    }
  ];

  useEffect(() => {
    // GSAP animations for page load
    gsap.fromTo('.hero-carousel', 
      { opacity: 0 },
      { opacity: 1, duration: 1, ease: 'power2.out' }
    );

    gsap.fromTo('.category-card', 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6, delay: 0.5, stagger: 0.1, ease: 'power2.out' }
    );

    // Fetch featured products
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await fetch('/api/products?featured=true&limit=8');
      const data = await response.json();
      if (data.success) {
        setFeaturedProducts(data.products);
      }
    } catch (error) {
      console.error('Error fetching featured products:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const addToCart = async (productId) => {
    if (!user) {
      // Redirect to login if not authenticated
      window.location.href = '/login';
      return;
    }

    try {
      const response = await fetch('/api/users/cart', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productId, quantity: 1 })
      });

      const data = await response.json();
      if (data.success) {
        // Show success message
        alert('Item added to cart successfully!');
        // Trigger a custom event to update cart count in header
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      } else {
        alert(data.message || 'Failed to add item to cart');
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      alert('Error adding item to cart');
    }
  };

  useEffect(() => {
    let interval;
    if (isAutoPlaying) {
      interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying, heroSlides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="home-page">
      {/* Hero Carousel Section */}
      <section className="hero-carousel"
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        <div className="carousel-container">
          <div className="carousel-slides" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
            {heroSlides.map((slide, index) => (
              <div key={slide.id} className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}>
                <div className="slide-image">
                  <img src={slide.image} alt={slide.title} />
                  <div className="slide-overlay"></div>
                </div>
                <div className="slide-content">
                  <div className="slide-text">
                    <h2>{slide.title}</h2>
                    <p>{slide.subtitle}</p>
                    <a href={slide.link} className="slide-cta">
                      {slide.cta}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          <button className="carousel-nav prev" onClick={prevSlide}>
            <i className="fas fa-chevron-left"></i>
          </button>
          <button className="carousel-nav next" onClick={nextSlide}>
            <i className="fas fa-chevron-right"></i>
          </button>

          {/* Dots Indicator */}
          <div className="carousel-dots">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                className={`dot ${index === currentSlide ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <div className="container">
          <div className="categories-grid">
            {categories.map((category, index) => (
              <div key={index} className="category-card">
                <div className="category-header">
                  <h3>{category.title}</h3>
                </div>
                <div className="category-content">
                  <div className="category-image">
                    <img src={category.image} alt={category.title} />
                  </div>
                  <div className="category-links">
                    {category.items.map((item, itemIndex) => (
                      <a 
                        key={itemIndex} 
                        href={itemIndex === 0 ? category.link : `${category.link}&search=${encodeURIComponent(item)}`}
                        className="category-link"
                      >
                        {item}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="featured-products-section">
        <div className="container">
          <div className="section-header">
            <h2>Featured Products</h2>
            <Link to="/products" className="view-all-link">View All Products</Link>
          </div>
          
          {loadingProducts ? (
            <div className="products-loading">
              <div className="spinner"></div>
              <p>Loading featured products...</p>
            </div>
          ) : (
            <div className="products-grid">
              {featuredProducts.map((product) => (
                <div key={product._id} className="product-card">
                  <div className="product-image">
                    <Link to={`/products/${product._id}`}>
                      <img 
                        src={product.images?.[0]?.url || '/placeholder-product.jpg'} 
                        alt={product.title}
                      />
                    </Link>
                    {product.amazonChoice && (
                      <div className="amazon-choice-badge">
                        <span>Amazon's Choice</span>
                      </div>
                    )}
                    {product.primeEligible && (
                      <div className="prime-badge">
                        <img 
                          src="https://m.media-amazon.com/images/G/01/marketing/prime/detail_page/prime_logo_51x15._CB445956655_.png" 
                          alt="Prime" 
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="product-info">
                    <Link to={`/products/${product._id}`} className="product-title">
                      {product.title}
                    </Link>
                    
                    <div className="product-rating">
                      <div className="stars">
                        {[...Array(5)].map((_, i) => (
                          <i 
                            key={i} 
                            className={`fas fa-star ${i < Math.floor(product.rating || 4.5) ? 'filled' : ''}`}
                          />
                        ))}
                      </div>
                      <span className="rating-count">({product.numReviews || Math.floor(Math.random() * 1000)})</span>
                    </div>
                    
                    <div className="product-price">
                      <span className="current-price">${product.price.toFixed(2)}</span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <>
                          <span className="original-price">${product.originalPrice.toFixed(2)}</span>
                          <span className="discount">
                            Save ${(product.originalPrice - product.price).toFixed(2)}
                          </span>
                        </>
                      )}
                    </div>
                    
                    <div className="product-actions">
                      <button 
                        className="add-to-cart-btn"
                        onClick={() => addToCart(product._id)}
                      >
                        <i className="fas fa-shopping-cart"></i>
                        Add to Cart
                      </button>
                      <Link 
                        to={`/products/${product._id}`} 
                        className="view-details-btn"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Prime Section */}
      <section className="prime-section">
        <div className="container">
          <div className="prime-banner">
            <div className="prime-content">
              <h2>Prime members get unlimited fast delivery, exclusive deals and more</h2>
              <div className="prime-buttons">
                <button className="btn btn-primary">Join Prime</button>
                <a href="/prime" className="prime-learn-more">Learn more about Prime</a>
              </div>
            </div>
            <div className="prime-image">
              <img 
                src="https://m.media-amazon.com/images/I/41jLBhDISxL._SX300_SY300_QL70_FMwebp_.jpg" 
                alt="Amazon Prime"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon">
                <i className="fas fa-shipping-fast"></i>
              </div>
              <div className="feature-content">
                <h4>Fast, reliable delivery</h4>
                <p>Get your orders delivered quickly and safely</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <i className="fas fa-shield-alt"></i>
              </div>
              <div className="feature-content">
                <h4>Secure payments</h4>
                <p>Your payment information is always protected</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <i className="fas fa-undo"></i>
              </div>
              <div className="feature-content">
                <h4>Easy returns</h4>
                <p>Return items hassle-free within 30 days</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <i className="fas fa-headset"></i>
              </div>
              <div className="feature-content">
                <h4>Customer support</h4>
                <p>Get help from our dedicated support team</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;