import React from 'react';

const NotFound = () => {
  return (
    <div className="container" style={{ textAlign: 'center', padding: '80px 0' }}>
      <h1>404 - Page Not Found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <a href="/" className="btn btn-primary">Go Home</a>
    </div>
  );
};

export default NotFound;