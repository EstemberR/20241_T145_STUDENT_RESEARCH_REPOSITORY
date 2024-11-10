import '../css/ResearchRepository.css';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './resources/Sidebar';
import Header from './resources/Header';
import { getUserName, getToken } from './resources/Utils';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Dashboard.css';

const Repository = () => {
  const [showModal, setShowModal] = useState(false); 
  const navigate = useNavigate();
  const [userName] = useState(getUserName());

  const handleFilterClick = () => {
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false); 
  };

useEffect(() => {
  const token = getToken();
  if (!token) {
    alert('Please log in first.');
    localStorage.removeItem('userName');
    localStorage.removeItem('token');
    navigate('/');
  }
}, [navigate]);
  return (
    <div className="dashboard-container d-flex">
      <Sidebar />
      <div className="main-section col-10 d-flex flex-column">
        <Header userName={userName} />
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
            <button className="btn btn-success" onClick={handleFilterClick} style={{ width: "180px", height: "40px"}}>+ Apply Filter Results</button>
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
                  <button type="button" className="btn btn-success">Apply Filters</button>
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
