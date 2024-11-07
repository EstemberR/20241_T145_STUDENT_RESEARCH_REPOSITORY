import '../css/ResearchRepository.css';
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Dashboard.css';
import casLogo from '../../assets/cas-logo.jpg'; 

const Repository = () => {
  const location = useLocation();
  const [showModal, setShowModal] = useState(false); // State to control modal visibility

  const handleFilterClick = () => {
    setShowModal(true); // Show the modal when filter button is clicked
  };

  const handleClose = () => {
    setShowModal(false); // Close the modal
  };

  return (
    <div className="dashboard-container d-flex">
      {/* Sidebar (Occupies full height) */}
      <nav className="col-2 sidebar">
        <h3 className="text-center">STUDENT RESEARCH REPOSITORY SYSTEM</h3>
        <ul className="nav flex-column">
          <li className="nav-item">
          <Link className={`nav-link ${location.pathname === '/student/dashboard' ? 'active' : ''}`} to="/student/dashboard">
              <i className="fas fa-tachometer-alt search zx"></i> Dashboard
            </Link>
          </li>
          <li className="nav-item">
            <Link className={`nav-link ${location.pathname === '/student/repository' ? 'active' : ''}`} to="/student/repository">
              <i className="fas fa-book search zx"></i> Research Repository
            </Link>
          </li>
          <li className="nav-item">
            <Link className={`nav-link ${location.pathname === '/student/profile' ? 'active' : ''}`} to="/student/profile">
              <i className="fas fa-user search zx"></i> User Profile
            </Link>
          </li>
          <li className="nav-item">
            <Link className={`nav-link ${location.pathname === '/student/myResearch' ? 'active' : ''}`} to="/student/myResearch">
              <i className="fas fa-folder-open search zx"></i> My Research
            </Link>
          </li>
          <li className="nav-item">
          <Link className={`nav-link ${location.pathname === '/student/FAQ' ? 'active' : ''}`} to="/student/FAQ">
          <i className="fas fa-robot search zx"></i> FAQ
            </Link>
          </li>
          <li className="nav-item">
            <Link className={`nav-link ${location.pathname === '/student/notifications' ? 'active' : ''}`} to="/student/notifications">
              <i className="fas fa-bell search zx"></i> Notifications
            </Link>
          </li>
          <li className="nav-item">
            <Link className={`nav-link ${location.pathname === '/student/logout' ? 'active' : ''}`} to="/student/logout">
              <i className="fas fa-sign-out-alt search zx"></i> Logout
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
        <main className="main-content">
          {/* Search Bar and Buttons */}
          <div className="search-filter-container d-flex justify-content-between align-items-center">
            <input
              type="text"
              className="form-control search"
              placeholder="Search..."
            />
            <button className="search1" onClick={handleFilterClick} style={{ width: "180px", height: "40px"}}>+ Apply Filter Results</button>
            <button className="btn btn-secondary search2" style={{ width: "130px", height: "40px"}}>
              <i className="fas fa-bookmark search"></i>
            Bookmark</button>
          </div>
          {/* Filter Modal */}
          <div className={`modal fade ${showModal ? 'show' : ''}`} style={{ display: showModal ? 'block' : 'none' }} tabIndex="-1" role="dialog" aria-labelledby="filterModalLabel" aria-hidden={!showModal}>
            <div className="modal-dialog" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id="filterModalLabel">Filter Options</h5>
                  <button type="button" className="close" onClick={handleClose}>
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <div className="modal-body">
                  <form>
                    <div className="form-group">
                      <label htmlFor="option1">
                        <input type="checkbox" id="option1" /> Option 1
                      </label>
                    </div>
                    <div className="form-group">
                      <label htmlFor="option2">
                        <input type="checkbox" id="option2" /> Option 2
                      </label>
                    </div>
                    <div className="form-group">
                      <label htmlFor="option3">
                        <input type="checkbox" id="option3" /> Option 3
                      </label>
                    </div>
                  </form>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={handleClose}>Close</button>
                  <button type="button" className="btn btn-primary">Apply Filters</button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Repository;
