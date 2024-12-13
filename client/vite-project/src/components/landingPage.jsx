import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import casLogo from '../assets/cas.jpg';
import casBuilding from '../assets/cas_building.jpg';
import './css/landingPage.css';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

const LandingPage = () => {
  const navigate = useNavigate();
  const [showAbout, setShowAbout] = useState(false);
  const [showFeatures, setShowFeatures] = useState(false);

  const handleAboutClose = () => setShowAbout(false);
  const handleAboutShow = () => setShowAbout(true);
  const handleFeaturesClose = () => setShowFeatures(false);
  const handleFeaturesShow = () => setShowFeatures(true);

  const AboutModal = () => (
    <Modal show={showAbout} onHide={handleAboutClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>About Student Research Repository</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h5>College of Arts and Science - Student Research Repository</h5>
        <p>
          The Student Research Repository is a centralized digital platform designed to streamline 
          the management and accessibility of student research papers at the College of Arts and Science. 
          This system serves as a bridge between students, instructors, and administrators, facilitating 
          the submission, review, and archival of academic research work.
        </p>
        <h6>Our Mission</h6>
        <p>
          To provide a robust and user-friendly platform that promotes academic excellence by:
        </p>
        <ul>
          <li>Facilitating efficient research paper submissions and reviews</li>
          <li>Maintaining a searchable database of student research</li>
          <li>Supporting collaboration between students and instructors</li>
          <li>Preserving academic work for future reference</li>
        </ul>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleAboutClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );

  const FeaturesModal = () => (
    <Modal show={showFeatures} onHide={handleFeaturesClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>System Features</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="features-list">
          <h5>Key Features</h5>
          
          <h6 className="mt-4">For Students</h6>
          <ul>
            <li>Easy research paper submission process</li>
            <li>Track submission status in real-time</li>
            <li>Receive feedback from instructors</li>
            <li>Access to approved research papers</li>
          </ul>

          <h6 className="mt-4">For Instructors</h6>
          <ul>
            <li>Efficient paper review system</li>
            <li>Provide feedback to students</li>
            <li>Track student submissions</li>
            <li>Access to research database</li>
          </ul>

          <h6 className="mt-4">For Administrators</h6>
          <ul>
            <li>Comprehensive dashboard with analytics</li>
            <li>User management system</li>
            <li>Activity monitoring</li>
            <li>System configuration controls</li>
          </ul>

          <h6 className="mt-4">General Features</h6>
          <ul>
            <li>Secure user authentication</li>
            <li>Advanced search functionality</li>
            <li>Mobile-responsive design</li>
            <li>Data backup and recovery</li>
          </ul>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleFeaturesClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );

  return (
    <div className="landing-page-container-wrapper">
      <AboutModal />
      <FeaturesModal />

      <nav className="navbar navbar-expand-lg fixed-top landing-page-navbar">
        <div className="container-fluid">
          <div className="navbar-brand landing-page-nav-brand">
            <img src={casLogo} alt="Department Logo" height="50" style={{borderRadius: '50%'}}/>
            <span className="ms-3" style={{ fontWeight: 'bold' }}>Student Research Repository</span>
          </div>
          <div className="nav-links">
            <button className="landing-page-nav-button" onClick={handleAboutShow}>
              About
            </button>
            <button className="landing-page-nav-button" onClick={handleFeaturesShow}>
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