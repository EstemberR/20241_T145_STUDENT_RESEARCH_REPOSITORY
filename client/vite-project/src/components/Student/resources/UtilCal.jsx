export const getToken = () => {
  // Check localStorage first, then sessionStorage
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

export const isAuthenticated = () => {
  return !!getToken();
};

export const logout = () => {
  // Clear both storages to ensure complete logout
  localStorage.removeItem('token');
  localStorage.removeItem('userName');
  localStorage.removeItem('userRole');
  
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('userName');
  sessionStorage.removeItem('userRole');
  
  // Redirect to login page
  window.location.href = '/';
}; 