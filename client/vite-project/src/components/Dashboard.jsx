import casLogo from '../assets/cas-logo.jpg'; 
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/Dashboard.css';
import './css/Dashboard2.css';


const Dashboard = () => {
  const location = useLocation();

  return (
    <div className="dashboard-container d-flex">
      {/* Sidebar (Occupies full height) */}
      <nav className="col-2 sidebar">
        <h3 className="text-center">STUDENT RESEARCH REPOSITORY SYSTEM</h3>
        <ul className="nav flex-column">
          <li className="nav-item">
          <Link className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`} to="/dashboard">
              <i className="fas fa-tachometer-alt search"></i> Dashboard
            </Link>
          </li>
          <li className="nav-item">
            <Link className={`nav-link ${location.pathname === '/repository' ? 'active' : ''}`} to="/repository">
              <i className="fas fa-book search"></i> Research Repository
            </Link>
          </li>
          <li className="nav-item">
            <Link className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`} to="/profile">
              <i className="fas fa-user search"></i> User Profile
            </Link>
          </li>
          <li className="nav-item">
            <Link className={`nav-link ${location.pathname === '/myResearch' ? 'active' : ''}`} to="/myResearch">
              <i className="fas fa-folder-open search"></i> My Research
            </Link>
          </li>
          <li className="nav-item">
          <Link className={`nav-link ${location.pathname === '/FAQ' ? 'active' : ''}`} to="/FAQ">
          <i className="fas fa-robot search"></i> FAQ
            </Link>
          </li>
          <li className="nav-item">
            <Link className={`nav-link ${location.pathname === '/notifications' ? 'active' : ''}`} to="/notifications">
              <i className="fas fa-bell search"></i> Notifications
            </Link>
          </li>
          <li className="nav-item">
            <Link className={`nav-link ${location.pathname === '/logout' ? 'active' : ''}`} to="/logout">
              <i className="fas fa-sign-out-alt search"></i> Logout
            </Link>
          </li>
        </ul>
      </nav>

      {/* Main Section (Top logo row + Main content) */}
      <div className="main-section col-10 d-flex flex-column">
        {/* Top Row (Logo and Right Empty Space) */}
        <div className="top-row d-flex align-items-center">
          <header className="col-8 d-flex justify-content-center align-items-center">
            <img src={casLogo} alt="CAS Logo" className="cas-logo" />
          </header>
          <div className="col-2 user-info ms-auto d-flex align-items-center">
            <div className="user-details">
              <p className="user-name">Merryl Strife</p>
              <p className="user-role">Student</p>
            </div>
          </div>
        </div>
{/*---------------------------------END OF HEADER TEMPLATE----------------------------------------------------*/}
        {/* Main Content Area */}
        {/* CONTENT DATA EDIT DIRI PAG DYNAMIC NA */}
        <main className="main-content">
          <div className="contentRow d-flex align-items-start">
            <div className="notificationDashboard">
              <h4 className="researchLabel">Notifications Overview</h4>
              <div className="staticData">
                []
              </div>
            </div>
            <div className="researchDashboard">
            <h4 className="researchLabel">Research Submissions</h4>
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

          <div className="repositoryDashboard">
            <h4 className="repoLabel">Research Repository Overview</h4>
            <div className="staticData">
              []
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
