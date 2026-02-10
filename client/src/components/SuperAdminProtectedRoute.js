import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { adminAuthService } from '../services/api';

const SuperAdminProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    // Verify admin auth via API and check for super_admin role
    adminAuthService.verifyToken()
      .then(data => {
        const isValid = data.valid === true;
        const role = data.user?.role;
        
        setIsAuthenticated(isValid);
        setIsSuperAdmin(role === 'super_admin');
        
        if (!isValid) {
          localStorage.removeItem('adminData');
          localStorage.removeItem('isAdminLoggedIn');
        }
      })
      .catch(() => {
        setIsAuthenticated(false);
        setIsSuperAdmin(false);
        localStorage.removeItem('adminData');
        localStorage.removeItem('isAdminLoggedIn');
      });
  }, []);

  // Show loading while checking auth
  if (isAuthenticated === null) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #e2e8f0',
          borderTopColor: '#3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p>Verifying access...</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isSuperAdmin) {
    // If authenticated but not super_admin, redirect to regular admin dashboard
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

export default SuperAdminProtectedRoute;
