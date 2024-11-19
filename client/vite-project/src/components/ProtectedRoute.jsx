import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRole }) => {
  // Get token and user role from localStorage
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  // Check if user is authenticated and has correct role
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (userRole !== allowedRole) {
    // Redirect to appropriate dashboard based on role
    switch (userRole) {
      case 'student':
        return <Navigate to="/student/dashboard" replace />;
      case 'instructor':
        return <Navigate to="/instructor/instructor_dashboard" replace />;
      case 'admin':
        return <Navigate to="/admin/admin_dashboard" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute; 