import React from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import casLogo from '../assets/cas.jpg';
import casBuilding from '../assets/cas_building.jpg';
import './css/landingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-page-container-wrapper">
      <nav className="navbar navbar-expand-lg fixed-top landing-page-navbar">
        <div className="container-fluid">
          <div className="navbar-brand landing-page-nav-brand">
            <img src={casLogo} alt="Department Logo" height="50" style={{borderRadius: '50%'}}/>
            <span className="ms-3" style={{ fontWeight: 'bold' }}>Student Research Repository</span>
          </div>
          <div className="nav-links">
            <button className="landing-page-nav-button" onClick={() => navigate('#about')}>
              About
            </button>
            <button className="landing-page-nav-button" onClick={() => navigate('#features')}>
              Features
            </button>
            <button className="landing-page-login-button" onClick={() => navigate('/login')}>
              <i className="fas fa-sign-in-alt me-2"></i>
              Sign In
            </button>
          </div>
        </div>
      </nav>

      <section className="landing-page-hero-section container-fluid">
        <div className="row align-items-center">
          <div className="col-md-6">
            <div className="landing-page-hero-content">
              <h1 className="landing-page-welcome-title">Welcome to the College of Arts and Science</h1>
              <h2 className="landing-page-subtitle">Student Research Repository</h2>
              <p className="lead">
                Access and manage research papers efficiently. A centralized platform 
                for students, instructors, and administrators.
              </p>
              <div className="button-group">
                <button className="landing-page-login-button me-3" onClick={() => navigate('/login')}>
                  Sign in 
                </button>
                <button className="landing-page-explore-button" onClick={() => navigate('/explore')}>
                  Explore
                </button>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <img src={casBuilding} alt="BukSU Building" className="landing-page-hero-image" />
          </div>
        </div>
      </section>

      <section className="landing-page-features-section container-fluid" id="features">
        <div className="row">
          <div className="col-md-4">
            <div className="landing-page-feature-card">
              <i className="fas fa-book-reader fa-3x text-success mb-3"></i>
              <h3>Easy Access</h3>
              <p>Access research papers anytime, anywhere with our digital repository.</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="landing-page-feature-card">
              <i className="fas fa-search fa-3x text-success mb-3"></i>
              <h3>Smart Search</h3>
              <p>Find relevant research papers quickly with our advanced search features.</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="landing-page-feature-card">
              <i className="fas fa-shield-alt fa-3x text-success mb-3"></i>
              <h3>Secure Storage</h3>
              <p>Your research papers are safely stored and protected in our system.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="landing-page-custom-footer">
        <div className="container-fluid">
          <p className="mb-0">&copy; 2024 Bukidnon State University - Student Research Repository</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;