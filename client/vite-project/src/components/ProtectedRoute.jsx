import { Navigate, Outlet } from 'react-router-dom';
import { useEffect } from 'react';

const ProtectedRoute = ({ allowedRole }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  // Debug logging
  console.log('Protected Route Check:', {
    token: !!token,
    userRole,
    allowedRole,
    isMatching: userRole === allowedRole
  });

  // If no token, redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If role doesn't match, redirect to appropriate dashboard
  if (userRole !== allowedRole) {
    const dashboardPaths = {
      student: '/student/dashboard',
      instructor: '/instructor/instructor_dashboard',
      admin: '/admin/admin_dashboard',
      superadmin: '/superadmin/dashboard'
    };

    // Only redirect if user has a valid role
    if (userRole && dashboardPaths[userRole]) {
      return <Navigate to={dashboardPaths[userRole]} replace />;
    }

    // If role is invalid, redirect to login
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute; 