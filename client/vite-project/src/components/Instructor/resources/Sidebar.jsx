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
    <h3 className="text-center x">INSTRUCTOR VIEW RESEARCH REPOSITORY</h3>
    <ul className="nav flex-column">
    <li className="nav-item">
    <Link className={`nav-link ${location.pathname === '/instructor/instructor_dashboard' ? 'active' : ''}`} to="/instructor/instructor_dashboard">
        <i className="fas fa-tachometer-alt dashboard zx"></i> Dashboard
        </Link>
    </li>
    <li className="nav-item">
    <Link className={`nav-link ${location.pathname === '/instructor/submissions' ? 'active' : ''}`} to="/instructor/submissions">
    <i className="fas fa-file-alt submission zx"></i> Student Submissions
        </Link>
    </li>
    <li className="nav-item">
    <Link className={`nav-link ${location.pathname === '/instructor/profile' ? 'active' : ''}`} to="/instructor/profile">
    <i className="fas fa-user-circle profile zx"></i> Profile
        </Link>
    </li>
    <li className="nav-item">
    <Link className={`nav-link ${location.pathname === '/instructor/requesting' ? 'active' : ''}`} to="/instructor/requesting">
    <i className="fas fa-user-shield request zx"></i> Role Request
        </Link>
    </li>
    <li className="nav-item">
    <Link className={`nav-link ${location.pathname === '/instructor/students' ? 'active' : ''}`} to="/instructor/students">
    <i className="fas fa-users students zx"></i> Student Profiles
        </Link>
    </li>
    <li className="nav-item">
    <Link className={`nav-link ${location.pathname === '/instructor/notifications' ? 'active' : ''}`} to="/instructor/notifications">
    <i className="fas fa-bell notification zx"></i> Notifications
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
