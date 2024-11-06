import casLogo from '../../assets/cas-logo.jpg'; 
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Dashboard.css';
import '../css/Dashboard2.css';
import '../css/admin_dashboard.css';

const InstructorRequest = () => {
  const location = useLocation();
  
  // Static list of research titles (placeholder)
  const researchList = [
    "AI in Smart Parking Systems",
    "IoT-based Emission Monitoring",
    "Vehicle Speed Sensor Development",
    "Smart Exhaust Emissions Detector",
  ];

  const [selectedResearch, setSelectedResearch] = useState("");

  // Handler for dropdown change
  const handleResearchChange = (e) => {
    setSelectedResearch(e.target.value);
  };

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
            <div className="user-details">
              <p className="user-name">JONARD SANICO</p>
              <p className="user-role">Instructor</p>
            </div>
          </div>
        </div>

        <main className="main-content p-4">
        <div className="container mt-4 notify">
          <h4 className="my-3">REQUEST AS ADVISER</h4>
          <div className="card mt-4">
            <div className="card-body">
              <form>
                <div className="mb-3">
                  <label htmlFor="researchSelect" className="form-label">Select Research to Apply As Adviser</label>
                  <select 
                    id="researchSelect" 
                    className="form-select" 
                    value={selectedResearch} 
                    onChange={handleResearchChange}
                  >
                    <option value="">Choose a research project...</option>
                    {researchList.map((research, index) => (
                      <option key={index} value={research}>{research}</option>
                    ))}
                  </select>
                </div>
                <div className="text-center">
                  <button type="submit" className="btn btn-primary">
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default InstructorRequest;
