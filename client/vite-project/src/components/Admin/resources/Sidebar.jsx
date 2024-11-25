// src/components/Sidebar.js
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { handleLogout } from './Utils.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../css/Dashboard.css';
import '../../css/Dashboard2.css';
import '../../css/admin_dashboard.css';
const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
  
    const handleLogoutClick = () => {
      handleLogout(navigate);
    };
  
  return (
      <nav className="col-2 sidebar">
        <h3 className="text-center x">STUDENT RESEARCH REPOSITORY</h3>
        <ul className="nav flex-column">
          <li className="nav-item">
          <Link className={`nav-link ${location.pathname === '/admin/admin_dashboard' ? 'active' : ''}`} to="/admin/admin_dashboard">
              <i className="fas fa-tachometer-alt search zx"></i> Admin Dashboard
            </Link>
          </li>
          <li className="nav-item">
            <Link className={`nav-link ${location.pathname === '/admin/accounts' ? 'active' : ''}`} to="/admin/accounts">
              <i className="fas fa-user search zx"></i> Manage Accounts
            </Link>
          </li>
          <li className="nav-item">
          <Link className={`nav-link ${location.pathname === '/admin/activity' ? 'active' : ''}`} to="/admin/activity">
          <i className="fas fa-robot search zx"></i> User Activity
            </Link>
          </li>
          <li className="nav-item">
            <Link className={`nav-link ${location.pathname === '/admin/report' ? 'active' : ''}`} to="/admin/report">
              <i className="fas fa-bell search zx"></i> Generate Report
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
