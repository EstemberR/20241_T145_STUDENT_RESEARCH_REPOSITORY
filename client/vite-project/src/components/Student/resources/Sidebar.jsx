// src/components/Sidebar.js
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { handleLogout } from './Utils.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../css/Dashboard.css';
import '../../css/Dashboard2.css';
import { logout } from './UtilCal.jsx';
const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
  
    const handleLogoutClick = () => {
      handleLogout(navigate);
    };
  
  return (
    <nav className="col-2 sidebar">
    <h3 className="text-center">STUDENT RESEARCH REPOSITORY SYSTEM</h3>
    <ul className="nav flex-column">
      <li className="nav-item">
      <Link className={`nav-link ${location.pathname === '/student/dashboard' ? 'active' : ''}`} to="/student/dashboard">
          <i className="fas fa-tachometer-alt search zx"></i> Dashboard
        </Link>
      </li>
      <li className="nav-item">
        <Link className={`nav-link ${location.pathname === '/student/repository' ? 'active' : ''}`} to="/student/repository">
          <i className="fas fa-book search zx"></i> Research Repository
        </Link>
      </li>
      <li className="nav-item">
        <Link className={`nav-link ${location.pathname === '/student/profile' ? 'active' : ''}`} to="/student/profile">
          <i className="fas fa-user search zx"></i> User Profile
        </Link>
      </li>
      <li className="nav-item">
        <Link className={`nav-link ${location.pathname === '/student/myResearch' ? 'active' : ''}`} to="/student/myResearch">
          <i className="fas fa-folder-open search zx"></i> My Research
        </Link>
      </li>
      <li className="nav-item">
      <Link className={`nav-link ${location.pathname === '/student/FAQ' ? 'active' : ''}`} to="/student/FAQ">
      <i className="fas fa-robot search zx"></i> FAQ
        </Link>
      </li>
      <li className="nav-item">
        <Link className={`nav-link ${location.pathname === '/student/notifications' ? 'active' : ''}`} to="/student/notifications">
          <i className="fas fa-bell search zx"></i> Notifications
        </Link>
      </li>
          <li className="nav-item">
          <span className="nav-link" onClick={handleLogoutClick} to="/">
            <i className="fas fa-sign-out-alt logout zx"></i> Logout
          </span>
        </li>
        </ul>
      </nav>
  )
};
export default Sidebar;
