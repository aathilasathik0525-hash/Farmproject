import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem 0', color: 'var(--slate-500)' }}>
        Loading session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRole = user?.role === 'BUYER' ? 'CUSTOMER' : user?.role;

  if (
    allowedRoles.length > 0 &&
    !allowedRoles.includes(userRole) &&
    !allowedRoles.includes(user?.role)
  ) {
    // Redirect to user's authorized home portal
    if (userRole === 'FARMER') return <Navigate to="/farmer" replace />;
    if (userRole === 'CUSTOMER' || userRole === 'BUYER') return <Navigate to="/customer/orders" replace />;
    if (userRole === 'FPO') return <Navigate to="/fpo" replace />;
    if (userRole === 'LOGISTICS') return <Navigate to="/admin/shipments" replace />;
    if (userRole === 'ADMIN') return <Navigate to="/admin" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
