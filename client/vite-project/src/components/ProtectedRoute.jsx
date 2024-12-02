import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

const ProtectedRoute = ({ allowedRole }) => {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  // Debug logging
  console.log('Protected Route Check:', {
    token: !!token,
    userRole,
    allowedRole,
    isMatching: userRole === allowedRole,
    currentPath: location.pathname
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
      admin: '/admin/accounts',
      superadmin: '/superadmin/superAdmin_accounts'
    };

    // Only redirect if user has a valid role
    if (userRole && dashboardPaths[userRole]) {
      return <Navigate to={dashboardPaths[userRole]} replace />;
    }

    // If role is invalid, redirect to login
    return <Navigate to="/login" replace />;
  }

  // For admin role only, check permissions
  if (userRole === 'admin') {
    const userPermissions = JSON.parse(localStorage.getItem('userPermissions') || '[]');
    const requiresPermission = (path) => {
      const permissionMap = {
        '/admin/accounts': 'manage_accounts',
        '/admin/repository': 'manage_repository',
        '/admin/activity': 'view_user_activity',
        '/admin/report': 'generate_reports'
      };
      return permissionMap[path];
    };

    const requiredPermission = requiresPermission(location.pathname);
    
    if (requiredPermission && !userPermissions.includes(requiredPermission)) {
      console.log('Permission denied:', {
        required: requiredPermission,
        userHas: userPermissions
      });

      const permissionToRouteMap = {
        'manage_accounts': '/admin/accounts',
        'manage_repository': '/admin/repository',
        'view_user_activity': '/admin/activity',
        'generate_reports': '/admin/report'
      };

      const firstAllowedRoute = userPermissions
        .map(perm => permissionToRouteMap[perm])
        .find(route => route);

      return <Navigate to={firstAllowedRoute || '/login'} replace />;
    }
  }

  // If all checks pass, render the route
  return <Outlet />;
};

export default ProtectedRoute; 