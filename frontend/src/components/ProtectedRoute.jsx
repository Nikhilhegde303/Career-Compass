import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { authUtils } from '../utils/auth';

const ProtectedRoute = () => {
  const isAuthenticated = authUtils.isAuthenticated();

  // If user is not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;