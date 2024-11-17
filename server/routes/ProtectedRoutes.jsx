import { Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

const ProtectedRoute = ({ children, userRole }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const storedRole = localStorage.getItem('userRole');

      // Detailed debugging logs
      console.log('=== Auth Check Details ===');
      console.log('Token exists:', !!token);
      console.log('Stored Role:', storedRole);
      console.log('Expected Role:', userRole);
      console.log('Current Path:', location.pathname);

      if (!token || !storedRole) {
        console.log('Missing credentials:', { token: !!token, role: !!storedRole });
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      // Simple direct comparison
      const isRoleMatch = storedRole === userRole;
      console.log('Role match result:', isRoleMatch);

      setIsAuthenticated(isRoleMatch);
      setIsLoading(false);
    };

    checkAuth();
  }, [userRole, location]);

  // Debug render state
  console.log('Component State:', { isLoading, isAuthenticated });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found - redirecting to login');
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
    console.log('Authentication failed - redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;