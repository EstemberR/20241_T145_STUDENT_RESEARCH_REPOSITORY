import casLogo from '../../assets/cas-logo.jpg'; 
import React, { useState } from 'react'; 
import { Link, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Dashboard.css';
import '../css/Dashboard2.css';
import '../css/admin_dashboard.css';

const AdminAccounts = () => {
  const location = useLocation();
  const [selectedUser, setSelectedUser] = useState(null); 
  const [activeTab, setActiveTab] = useState('Students'); 

  // STATIC DATA
  //ANG STATUS WALA NA SA DATABASE PERO NEED PARA MADISPLAY SA TABLE
  const userData = [
    { id: 1, name: 'Jane Smith', email: 'jane.smith@example.com', role: 'Student', status: 'Students' },
    { id: 2, name: 'John Doe', email: 'john.doe@example.com', role: 'Instructor', status: 'Instructors' },
    { id: 3, name: 'Mark Lee', email: 'mark.lee@example.com', role: 'Adviser', status: 'Advisers' },
    { id: 4, name: 'Sara Kim', email: 'sara.kim@example.com', role: 'Panel', status: 'Panels' },
    { id: 5, name: 'Okarun', email: 'okarun@student.buksu.edu.ph', role: 'Student', status: 'Archived' },
  ];

  const filteredUsers = userData.filter((user) => user.status === activeTab);

  const handleViewClick = (user) => {
    setSelectedUser(user); 
    const viewModal = new window.bootstrap.Modal(document.getElementById('viewModal'));
    viewModal.show();
  };

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

        <main className="main-content">
          <div className="container">
            <h4 className="my-3">User Accounts Management</h4>
            <ul className="nav nav-tabs">
            <li className="nav-item students">
                <button
                  className={`nav-link ${activeTab === 'Students' ? 'active' : ''} x`}
                  onClick={() => setActiveTab('Students')}
                >
                  Students
                </button> 
              </li>
              <li className="nav-item instructors">
                <button
                  className={`nav-link ${activeTab === 'Instructors' ? 'active' : ''} x`}
                  onClick={() => setActiveTab('Instructors')}
                >
                  Instructors
                </button>
              </li>
              <li className="nav-item advisers">
                <button
                  className={`nav-link ${activeTab === 'Advisers' ? 'active' : ''} x`}
                  onClick={() => setActiveTab('Advisers')}
                >
                  Advisers
                </button>
              </li>
              <li className="nav-item panels">
                <button
                  className={`nav-link ${activeTab === 'Panels' ? 'active' : ''} x`}
                  onClick={() => setActiveTab('Panels')}
                >
                  Panels
                </button>
              </li>
              <li className="nav-item archived">
                <button
                  className={`nav-link ${activeTab === 'Archived' ? 'active' : ''} x`}
                  onClick={() => setActiveTab('Archived')}
                >
                  Archived Accounts
                </button>
              </li>
            </ul>

            {/* Table for Active Tab */}
            <table className="table table-green-theme table-striped table-bordered mt-3">
              <thead className="table-primary">
                <tr>
                  <th className="centering">ID</th>
                  <th className="centering">Name</th>
                  <th className="centering">Role</th>
                  <th className="centering">Email</th>
                  <th className="centering">Status</th>
                  <th className="centering">View</th>
                  <th className="centering">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="centering">{user.id}</td>
                    <td className="centering">{user.name}</td>
                    <td className="centering">{user.role}</td>
                    <td className="centering">{user.email}</td>
                    <td className="centering">{user.status}</td>
                    <td className="centering">
                      <button
                        className="btn btn-info btn-sm"
                        onClick={() => handleViewClick(user)}>
                        <i className="fas fa-eye"></i> View
                      </button>
                    </td>
                    <td className="centering">
                      {activeTab === 'Instructors' && (
                        <>
                          <button className="btn btn-success btn-sm ms-2">
                            <i className="fas fa-check"></i> Activate
                          </button>
                          <button className="btn btn-warning btn-sm ms-2">
                            <i className="fas fa-archive"></i> Archive
                          </button>
                        </>
                      )}
                      {activeTab === 'Advisers' && (
                        <>
                          <button className="btn btn-primary btn-sm ms-2">
                            <i className="fas fa-pencil-alt"></i> Edit
                          </button>
                          <button className="btn btn-warning btn-sm ms-2">
                            <i className="fas fa-archive"></i> Archive
                          </button>
                        </>
                      )}
                      {activeTab === 'Panels' && (
                        <>
                          <button className="btn btn-primary btn-sm ms-2">
                            <i className="fas fa-eye"></i> Assign
                          </button>
                          <button className="btn btn-warning btn-sm ms-2">
                            <i className="fas fa-archive"></i> Archive
                          </button>
                        </>
                      )}
                      {activeTab === 'Students' && (
                        <>
                          <button className="btn btn-warning btn-sm ms-2">
                            <i className="fas fa-archive"></i> Archive
                          </button>
                        </>
                      )}
                      {activeTab === 'Archived' && (
                        <>
                          <button className="btn btn-warning btn-sm ms-2">
                            <i className="fas fa-archive"></i> Restore
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
        {/* Modal for Viewing User Details */}
        <div
          className="modal fade"
          id="viewModal"
          tabIndex="-1"
          aria-labelledby="viewModalLabel"
          aria-hidden="true">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="viewModalLabel">User Details</h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                {selectedUser && (
                  <>
                    <h5>Name:</h5>
                    <p>{selectedUser.name}</p>
                    <h5>Role:</h5>
                    <p>{selectedUser.role}</p>
                    <h5>Email:</h5>
                    <p>{selectedUser.email}</p>
                    <h5>Status:</h5>
                    <p>{selectedUser.status}</p>
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
    </div>
  );
};

export default AdminAccounts;
