import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { adminAuthService } from '../services/api';

const AdminProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    // Verify admin auth via API (token is in httpOnly cookie)
    adminAuthService.verifyToken()
      .then(data => {
        setIsAuthenticated(data.valid === true);
      })
      .catch(() => {
        setIsAuthenticated(false);
        localStorage.removeItem('adminData');
        localStorage.removeItem('isAdminLoggedIn');
      });
  }, []);

  // Show loading while checking auth
  if (isAuthenticated === null) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default AdminProtectedRoute;
