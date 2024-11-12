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
    <div className="container-wrapper">
      <nav className="navbar navbar-expand-lg fixed-top custom-navbar">
        <div className="container-fluid">
          <div className="navbar-brand nav-brand">
            <img src={casLogo} alt="Department Logo" height="50" />
            <span className="ms-3">Student Research Repository</span>
          </div>
          <div className="nav-links">
            <a href="#about" className="nav-link">About</a>
            <a href="#features" className="nav-link">Features</a>
            <button className="login-button" onClick={() => navigate('/login')}>
              <i className="fas fa-sign-in-alt me-2"></i>
              Sign In
            </button>
          </div>
        </div>
      </nav>

      <section className="hero-section container-fluid">
        <div className="row align-items-center">
          <div className="col-md-6">
            <div className="hero-content">
              <h1>Welcome to College of Arts and Science</h1>
              <h2>Student Research Repository</h2>
              <p className="lead">
                Access and manage research papers efficiently. A centralized platform 
                for students, instructors, and administrators.
              </p>
              <div className="button-group">
                <button className="login-button me-3" onClick={() => navigate('/login')} style={{width: '50%', fontSize: '1.6rem'}}>
                  Sign in 
                </button>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <img src={casBuilding} alt="BukSU Building" className="hero-image" />
          </div>
        </div>
      </section>

      <section className="features-section container-fluid" id="features">
        <div className="row">
          <div className="col-md-4">
            <div className="feature-card">
              <i className="fas fa-book-reader fa-3x text-success mb-3"></i>
              <h3>Easy Access</h3>
              <p>Access research papers anytime, anywhere with our digital repository.</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="feature-card">
              <i className="fas fa-search fa-3x text-success mb-3"></i>
              <h3>Smart Search</h3>
              <p>Find relevant research papers quickly with our advanced search features.</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="feature-card">
              <i className="fas fa-shield-alt fa-3x text-success mb-3"></i>
              <h3>Secure Storage</h3>
              <p>Your research papers are safely stored and protected in our system.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="custom-footer">
        <div className="container-fluid">
          <p className="mb-0">&copy; 2024 Bukidnon State University - Student Research Repository</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;