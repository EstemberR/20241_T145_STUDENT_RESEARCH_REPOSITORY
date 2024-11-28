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
            <Link 
              className={`nav-link ${location.pathname === '/superadmin/superAdmin_accounts' ? 'active' : ''}`} 
              to="/superadmin/superAdmin_accounts"
            >
              <i className="fas fa-user search zx"></i> Manage Accounts
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              className={`nav-link ${location.pathname === '/superadmin/superAdmin_role-requests' ? 'active' : ''}`} 
              to="/superadmin/superAdmin_role-requests"
              >
              <i className="fas fa-folder-open search zx"></i> Role Requests
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              className={`nav-link ${location.pathname === '/superadmin/superAdmin_reports' ? 'active' : ''}`} 
              to="/superadmin/superAdmin_reports"
             >
              <i className="fas fa-bell search zx"></i> Generate Report
            </Link>
          </li>
          <li className="nav-item">
            <span className="nav-link" onClick={handleLogoutClick}>
              <i className="fas fa-sign-out-alt logout zx"></i> Logout
            </span>
          </li>
        </ul>
      </nav>
    );
};

export default Sidebar;
