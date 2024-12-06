export const getUserName = () => localStorage.getItem('userName');
export const getToken = () => localStorage.getItem('token');
export const handleLogout = (navigate) => {
  localStorage.removeItem('userName');
  localStorage.removeItem('token');
  localStorage.removeItem('userRole');
  navigate('/');
};