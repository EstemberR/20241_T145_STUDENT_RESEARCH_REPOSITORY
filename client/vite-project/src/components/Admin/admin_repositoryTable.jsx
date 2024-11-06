import casLogo from '../../assets/cas-logo.jpg'; 
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Dashboard.css';
import '../css/Dashboard2.css';
import '../css/admin_dashboard.css';

const AdminRepo = () => {
  const location = useLocation();
const [selectedResearch, setSelectedResearch] = useState(null);
const [activeTab, setActiveTab] = useState('Pending'); // State to control which table is shown

// Sample data
const researchData = [
  { id: 1, title: 'Research Paper 1', author: 'Lin A., Xin C., Ray A.', date: '2024-01-01', status: 'Accepted' },
  { id: 2, title: 'Research Paper 2', author: 'May A., Kay C.', date: '2024-02-01', status: 'Pending' },
  { id: 3, title: 'Research Paper 3', author: 'John D., Alice B.', date: '2024-03-15', status: 'Archived' },
];

const handleViewClick = (research) => {
  setSelectedResearch(research);
  const viewModal = new window.bootstrap.Modal(document.getElementById('viewModal'));
  viewModal.show();
};

// Filter data based on the active tab
const filteredData = researchData.filter((research) => research.status === activeTab);
  return (
    <div className="dashboard-container d-flex">
      {/* Sidebar (Occupies full height) */}
      <nav className="col-2 sidebar">
        <h3 className="text-center x">ADMIN VIEW RESEARCH REPOSITORY</h3>
        <ul className="nav flex-column">
          <li className="nav-item">
            <Link className={`nav-link ${location.pathname === '/admin/admin_dashboard' ? 'active' : ''}`} to="/admin/admin_dashboard">
              <i className="fas fa-tachometer-alt search"></i> Admin Dashboard
            </Link>
          </li>
          <li className="nav-item">
            <Link className={`nav-link ${location.pathname === '/admin/repositoryTable' ? 'active' : ''}`} to="/admin/repositoryTable">
              <i className="fas fa-book search"></i> Repository Table
            </Link>
          </li>
          <li className="nav-item">
            <Link className={`nav-link ${location.pathname === '/admin/accounts' ? 'active' : ''}`} to="/admin/accounts">
              <i className="fas fa-user search"></i> Manage Accounts
            </Link>
          </li>
          <li className="nav-item">
            <Link className={`nav-link ${location.pathname === '/admin/request' ? 'active' : ''}`} to="/admin/request">
              <i className="fas fa-folder-open search"></i> Role Requests
            </Link>
          </li>
          <li className="nav-item">
          <Link className={`nav-link ${location.pathname === '/admin/activity' ? 'active' : ''}`} to="/admin/activity">
          <i className="fas fa-robot search"></i> User Activity
            </Link>
          </li>
          <li className="nav-item">
            <Link className={`nav-link ${location.pathname === '/admin/report' ? 'active' : ''}`} to="/admin/report">
              <i className="fas fa-bell search"></i> Generate Report
            </Link>
          </li>
          <li className="nav-item">
            <Link className={`nav-link ${location.pathname === '/admin/logout' ? 'active' : ''}`} to="/admin/logout">
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
{/*------------------------------------------sTATIC DATA----------------------------------------------------*/}
       {/* Research Repository Table */}
       <div className="container">
          <h4 className="my-3">Research Repository Table</h4>
          <ul className="nav nav-tabs">
            <li className="nav-item pending">
              <button
                className={`nav-link ${activeTab === 'Pending' ? 'active' : ''} x`}
                onClick={() => setActiveTab('Pending')}
              >
                Pending
              </button>
            </li>
            <li className="nav-item accepted">
              <button
                className={`nav-link ${activeTab === 'Accepted' ? 'active' : ''} x`}
                onClick={() => setActiveTab('Accepted')}
              >
                Accepted
              </button>
            </li>
            <li className="nav-item archived">
              <button
                className={`nav-link ${activeTab === 'Archived' ? 'active' : ''} x`}
                onClick={() => setActiveTab('Archived')}
              >
                Archived
              </button>
            </li>
          </ul>

          {/* Table for Active Tab */}
          <table className="table table-green-theme table-striped table-bordered mt-3">
            <thead className="table-primary">
              <tr>
                <th className="centering">ID</th>
                <th className="centering">Title</th>
                <th className="centering">Author</th>
                <th className="centering">Date Submitted</th>
                <th className="centering">Status</th>
                <th className="centering">View</th>
                <th className="centering">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((research) => (
                <tr key={research.id}>
                  <td className="centering">{research.id}</td>
                  <td className="centering">{research.title}</td>
                  <td className="centering">{research.author}</td>
                  <td className="centering">{research.date}</td>
                  <td className="centering">{research.status}</td>
                  <td className="centering">
                    <button
                      className="btn btn-info btn-sm"
                      onClick={() => handleViewClick(research)}>
                      <i className="fas fa-eye"></i> View
                    </button>
                  </td>
                  <td className="centering">
                    {activeTab === 'Pending' && (
                        <>
                          <button className="btn btn-success btn-sm ms-2">
                            <i className="fas fa-check"></i> Accept
                          </button>
                          <button className="btn btn-danger btn-sm ms-2">
                            <i className="fas fa-times"></i> Reject
                          </button>
                        </>
                      )}
                      {activeTab === 'Accepted' && (
                        <button className="btn btn-warning btn-sm ms-2">
                           <i className="fas fa-archive"></i> Archive
                        </button>
                      )}
                      {activeTab === 'Archived' && (
                        <button className="btn btn-warning btn-sm ms-2">
                           <i className="fas fa-archive"></i> Restore
                        </button>
                      )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Viewing Research Details */}
      <div
        className="modal fade"
        id="viewModal"
        tabIndex="-1"
        aria-labelledby="viewModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="viewModalLabel">Research Details</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              {selectedResearch && (
                <>
                  <h5>Title:</h5>
                  <p>{selectedResearch.title}</p>
                  <h5>Author:</h5>
                  <p>{selectedResearch.author}</p>
                  <h5>Date Published:</h5>
                  <p>{selectedResearch.date}</p>
                  <h5>Status:</h5>
                  <p>{selectedResearch.status}</p>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRepo;
