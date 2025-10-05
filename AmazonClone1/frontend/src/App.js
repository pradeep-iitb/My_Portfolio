import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Components
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Products from './pages/Products/Products';
import ProductDetail from './pages/Products/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Profile from './pages/User/Profile';
import Orders from './pages/User/Orders';
import Wishlist from './pages/User/Wishlist';
import Search from './pages/Search/Search';
import NotFound from './pages/NotFound';

// Context
import { useAuth } from './contexts/AuthContext';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

function App() {
  const { user, loading } = useAuth();

  useEffect(() => {
    // GSAP page transition setup
    gsap.set('.page-transition', { opacity: 0, y: 20 });
    
    // Animate page entrance
    gsap.to('.page-transition', {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power2.out'
    });

    // Scroll-triggered animations
    gsap.utils.toArray('.animate-on-scroll').forEach((element) => {
      gsap.fromTo(element, 
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: element,
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    });

    return () => {
      // Cleanup ScrollTrigger instances
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-center align-center" style={{ height: '100vh' }}>
        <div className="spinner-large"></div>
      </div>
    );
  }

  return (
    <div className="App">
      <Header />
      
      <main className="page-transition" style={{ minHeight: 'calc(100vh - 120px)' }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/search" element={<Search />} />
          
          {/* Auth Routes */}
          <Route 
            path="/login" 
            element={user ? <Navigate to="/" replace /> : <Login />} 
          />
          <Route 
            path="/register" 
            element={user ? <Navigate to="/" replace /> : <Register />} 
          />
          
          {/* Protected Routes */}
          <Route path="/cart" element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          } />
          <Route path="/checkout" element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          } />
          <Route path="/order-success" element={
            <ProtectedRoute>
              <OrderSuccess />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/orders" element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          } />
          <Route path="/wishlist" element={
            <ProtectedRoute>
              <Wishlist />
            </ProtectedRoute>
          } />
          
          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      
      <Footer />
    </div>
  );
}

export default App;