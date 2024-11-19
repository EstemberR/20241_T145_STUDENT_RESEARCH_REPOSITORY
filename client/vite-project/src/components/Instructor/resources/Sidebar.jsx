// src/components/Sidebar.js
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { handleLogout } from './Utils.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../css/Dashboard.css';
import '../../css/Dashboard2.css';
import '../../css/admin_dashboard.css';
const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [userRoles, setUserRoles] = useState([]);
  
    useEffect(() => {
        // Fetch user profile to get roles
        const fetchUserProfile = async () => {
            try {
                const response = await fetch('http://localhost:8000/instructor/profile', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const data = await response.json();
                setUserRoles(data.role || []);
            } catch (error) {
                console.error('Error fetching user profile:', error);
            }
        };
  
        fetchUserProfile();
    }, []);
  
    const handleLogoutClick = () => {
      handleLogout(navigate);
    };
  
  return (
    <nav className="col-2 sidebar">
    <h3 className="text-center x">STUDENT RESEARCH REPOSITORY</h3>
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
    {userRoles.includes('instructor') && userRoles.includes('adviser') && (
        <li className="nav-item">
            <Link 
                className={`nav-link ${location.pathname === '/instructor/adviser-researches' ? 'active' : ''}`} 
                to="/instructor/adviser-researches"
            >
                <i className="fas fa-microscope zx"></i> Adviser Researches
            </Link>
        </li>
    )}
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
