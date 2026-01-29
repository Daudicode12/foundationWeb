import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../services/api';

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    // Verify auth via API (token is in httpOnly cookie)
    authService.verifyToken()
      .then(data => {
        setIsAuthenticated(data.valid === true);
      })
      .catch(() => {
        setIsAuthenticated(false);
        localStorage.removeItem('userData');
        localStorage.removeItem('isLoggedIn');
      });
  }, []);

  // Show loading while checking auth
  if (isAuthenticated === null) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
