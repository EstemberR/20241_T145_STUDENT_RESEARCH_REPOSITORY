import casLogo from '../assets/cas-logo.jpg'; 
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/Dashboard.css';
import './css/Dashboard2.css';
import './css/admin_dashboard.css';

const InstructorDashboard = () => {
  const location = useLocation();

  return (
    <div className="dashboard-container d-flex">
      {/* Sidebar (Occupies full height) */}
      <nav className="col-2 sidebar">
        <h3 className="text-center x">ADMIN VIEW RESEARCH REPOSITORY</h3>
        <ul className="nav flex-column">
          <li className="nav-item">
            <Link className={`nav-link ${location.pathname === '/admin_dashboard' ? 'active' : ''}`} to="/admin_dashboard">
              <i className="fas fa-tachometer-alt search"></i> Admin Dashboard
            </Link>
          </li>
          <li className="nav-item">
            <Link className={`nav-link ${location.pathname === '/repositoryTable' ? 'active' : ''}`} to="/repositoryTable">
              <i className="fas fa-book search"></i> Repository Table
            </Link>
          </li>
          <li className="nav-item">
            <Link className={`nav-link ${location.pathname === '/accounts' ? 'active' : ''}`} to="/accounts">
              <i className="fas fa-user search"></i> Manage Accounts
            </Link>
          </li>
          <li className="nav-item">
            <Link className={`nav-link ${location.pathname === '/request' ? 'active' : ''}`} to="/request">
              <i className="fas fa-folder-open search"></i> Role Requests
            </Link>
          </li>
          <li className="nav-item">
          <Link className={`nav-link ${location.pathname === '/activity' ? 'active' : ''}`} to="/activity">
          <i className="fas fa-robot search"></i> User Activity
            </Link>
          </li>
          <li className="nav-item">
            <Link className={`nav-link ${location.pathname === '/report' ? 'active' : ''}`} to="/report">
              <i className="fas fa-bell search"></i> Generate Report
            </Link>
          </li>
          <li className="nav-item">
            <Link className={`nav-link ${location.pathname === '/logout' ? 'active' : ''}`} to="/logout">
              <i className="fas fa-sign-out-alt search"></i> Logout
            </Link>
          </li>
        </ul>
      </nav>

      <div className="main-section col-10 d-flex flex-column">
        <div className="top-row d-flex align-items-center">
          <header className="col-8 d-flex justify-content-center align-items-center">
            <img src={casLogo} alt="CAS Logo" className="cas-logo" />
          </header>
          <div className="col-2 user-info ms-auto d-flex align-items-center">
            <div className="user-details">
              <p className="user-name">JONARD SANICO</p>
              <p className="user-role">Admin</p>
            </div>
          </div>
        </div>

        <main className="main-content">
          <div className="contentRow d-flex align-items-start">
            <div className="notificationDashboard">
              <h4 className="researchLabel">Generate Report</h4>
              <div className="staticData">[]</div>
            </div>
            <div className="researchDashboard">
              <h4 className="researchLabel">Repository Table Submissions</h4>
              <div className="researchOverviewContainer">
                <div className="researchBox1">REVIEWED
                  <p>[]</p>
                </div>
                <div className="researchBox2">PENDING
                  <p>[]</p>
                </div>
                <div className="researchBox3">REJECTED
                  <p>[]</p>
                </div>
              </div>
            </div>
          </div>

          <div className="repositoryDashboards">
            <div className="repositoryOverviewContainer d-flex">
              <div className="repoBox">
                <p className="repoData">[MANAGE ACCOUNTS]</p>
              </div>
              <div className="repoBox">
                <p className="repoData">[ROLE REQUESTS]</p>
              </div>
              <div className="repoBox">
                <p className="repoData">[USER ACTIVITY]</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default InstructorDashboard;
