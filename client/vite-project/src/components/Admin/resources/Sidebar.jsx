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
    
    // Get user permissions from localStorage
    const userPermissions = JSON.parse(localStorage.getItem('userPermissions') || '[]');
    const userRole = localStorage.getItem('userRole');
    
    const handleLogoutClick = () => {
        handleLogout(navigate);
    };

    // Define navigation items with their required permissions
    const navItems = [
        {
            path: '/admin/accounts',
            icon: 'fas fa-user search zx',
            label: 'Manage Accounts',
            permission: 'manage_accounts'
        },
        {
            path: '/admin/repository',
            icon: 'fas fa-file-alt submission zx',
            label: 'Manage Repository',
            permission: 'manage_repository'
        },
        {
            path: '/admin/activity',
            icon: 'fas fa-robot search zx',
            label: 'User Activity',
            permission: 'view_user_activity'
        },
        {
            path: '/admin/report',
            icon: 'fas fa-bell search zx',
            label: 'Generate Report',
            permission: 'generate_reports'
        }
    ];

    return (
        <nav className="col-2 sidebar">
            <h3 className="text-center x">STUDENT RESEARCH REPOSITORY</h3>
            <ul className="nav flex-column">
                {navItems.map((item) => {
                    const hasPermission = userRole === 'superadmin' || userPermissions.includes(item.permission);
                    
                    return (
                        <li className="nav-item" key={item.path}>
                            {hasPermission ? (
                                <Link 
                                    className={`nav-link ${location.pathname === item.path ? 'active' : ''}`} 
                                    to={item.path}
                                >
                                    <i className={item.icon}></i> {item.label}
                                </Link>
                            ) : (
                                <span 
                                    className="nav-link disabled" 
                                    style={{ 
                                        opacity: 0.5, 
                                        cursor: 'not-allowed',
                                        position: 'relative'
                                    }}
                                    title="You don't have permission to access this feature"
                                >
                                    <i className={item.icon}></i> {item.label}
                                    <i 
                                        className="fas fa-lock" 
                                        style={{ 
                                            marginLeft: '8px',
                                            fontSize: '0.8em',
                                            color: '#dc3545'
                                        }}
                                    ></i>
                                </span>
                            )}
                        </li>
                    );
                })}
                <li className="nav-item">
                    <span className="nav-link" onClick={handleLogoutClick} style={{ cursor: 'pointer' }}>
                        <i className="fas fa-sign-out-alt logout zx"></i> Logout
                    </span>
                </li>
            </ul>
        </nav>
    );
};

export default Sidebar;
