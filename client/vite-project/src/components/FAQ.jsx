import casLogo from '../assets/cas-logo.jpg';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/Dashboard.css';
import './css/FAQ.css'

const FAQ = () => {
  const location = useLocation();

  const faqs = [
    {
      question: "What is the Student Research Repository System?",
      answer: "The Student Research Repository System is an online platform that allows students to submit, manage, and share their research work."
    },
    {
      question: "How can I submit my research?",
      answer: "You can submit your research by navigating to the 'My Research' section and following the submission instructions."
    },
    {
      question: "Who can access my research?",
      answer: "Only registered users with appropriate permissions can access your research submissions."
    },
    {
      question: "How do I update my profile?",
      answer: "You can update your profile information in the 'User Profile' section."
    },
    {
      question: "What should I do if I forget my password?",
      answer: "If you forget your password, use the 'Forgot Password' link on the login page to reset it."
    },
  ];

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
        <main className="main-content p-3">
          <h4 className="mb-3">Frequently Asked Questions</h4>
          <div className="accordion" id="faqAccordion">
            {faqs.map((faq, index) => (
              <div className="accordion-item" key={index}>
                <h2 className="accordion-header" id={`heading${index}`}>
                  <button
                    className="accordion-button"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target={`#collapse${index}`}
                    aria-expanded="true"
                    aria-controls={`collapse${index}`}
                  >
                    {faq.question}
                  </button>
                </h2>
                <div
                  id={`collapse${index}`}
                  className="accordion-collapse collapse"
                  aria-labelledby={`heading${index}`}
                  data-bs-parent="#faqAccordion"
                >
                  <div className="accordion-body">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default FAQ;
