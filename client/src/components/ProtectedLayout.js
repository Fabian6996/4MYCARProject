import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedLayout({ children }) {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default ProtectedLayout;
