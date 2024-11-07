import casLogo from '../../assets/cas-logo.jpg'; 
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Dashboard.css';
import '../css/Dashboard2.css';
import '../css/admin_dashboard.css';

const InstructorDashboard = () => {
  const location = useLocation();
  const [userName, setUserName] = useState('');
  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    if (storedName) {
        setUserName(storedName);
    }
}, []);

  return (
    <div className="dashboard-container d-flex">
      {/* Sidebar (Occupies full height) */}
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
            <Link className={`nav-link ${location.pathname === '/logout' ? 'active' : ''}`} to="/logout">
              <i className="fas fa-sign-out-alt logout zx"></i> Logout
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
          <img
          src={'https://via.placeholder.com/150'} //STATIC NALANG
          alt="Profile"
          className="img-fluid rounded-circle"
          style={{ width: '50PX', height: '50px' }}
        />
            <div className="user-details">
              <p className="user-name">{userName}</p>
              <p className="user-role">Instructor</p>
            </div>
          </div>
        </div>

        <main className="main-content">
          <div className="contentRow d-flex align-items-start">
            <div className="notificationDashboard">
              <h4 className="researchLabel">Generate Report rename</h4>
              <div className="staticData">[]</div>
            </div>
            <div className="researchDashboard">
              <h4 className="researchLabel">Repository Table Submissions rename</h4>
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
                <p className="repoData">[MANAGE ACCOUNTS] rename</p>
              </div>
              <div className="repoBox">
                <p className="repoData">[ROLE REQUESTS] rename</p>
              </div>
              <div className="repoBox">
                <p className="repoData">[USER ACTIVITY] rename</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default InstructorDashboard;
