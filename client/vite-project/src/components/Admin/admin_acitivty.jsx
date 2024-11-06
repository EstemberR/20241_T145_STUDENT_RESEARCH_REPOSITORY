import casLogo from '../../assets/cas-logo.jpg'; 
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Dashboard.css';
import '../css/Dashboard2.css';
import '../css/admin_dashboard.css';

const AdminActivity = () => {
  const location = useLocation();

  // Static user activity data
  const activityData = [
    { id: 1, user: 'Jonard Sanico', activity: 'Submitted research proposal', date: '2024-11-05' },
    { id: 2, user: 'Maria Lopez', activity: 'Approved research paper', date: '2024-11-04' },
    { id: 3, user: 'Carlos Dela Cruz', activity: 'Updated research entry', date: '2024-11-03' },
    { id: 4, user: 'Anna Reyes', activity: 'Reviewed research submission', date: '2024-11-02' },
    { id: 5, user: 'Peter Garcia', activity: 'Generated report', date: '2024-11-01' },
  ];

  // Static user counts
  const userCounts = {
    students: 120,
    instructors: 15,
    advisers: 8,
    panels: 5,
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
          {/* User counts with Bootstrap card layout */}
          <div className="container mt-3">
          <div className="container mt-3 exists">
            <h4>User Count Summary</h4>
            <div className="row mt-5">
              <div className="col-md-3 mb-3">
                <div className="card text-white bg-primary h-100">
                  <div className="card-body d-flex flex-column justify-content-center text-center">
                    <h5 className="card-title">Students</h5>
                    <p className="card-text display-4">{userCounts.students}</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3 mb-3">
                <div className="card text-white bg-info h-100">
                  <div className="card-body d-flex flex-column justify-content-center text-center">
                    <h5 className="card-title">Instructors</h5>
                    <p className="card-text display-4">{userCounts.instructors}</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3 mb-3">
                <div className="card text-white bg-success h-100">
                  <div className="card-body d-flex flex-column justify-content-center text-center">
                    <h5 className="card-title">Advisers</h5>
                    <p className="card-text display-4">{userCounts.advisers}</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3 mb-3">
                <div className="card text-white bg-warning h-100">
                  <div className="card-body d-flex flex-column justify-content-center text-center">
                    <h5 className="card-title">Panels</h5>
                    <p className="card-text display-4">{userCounts.panels}</p>
                  </div>
                </div>
              </div>
            </div>
            </div>

            {/* User activity log table */}
            <h4 className="mt-5">User Activity Log</h4>
            <table className="table table-green-theme table-striped table-bordered mt-3">
              <thead className="thead-dark">
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Activity</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {activityData.map((activity) => (
                  <tr key={activity.id}>
                    <td>{activity.id}</td>
                    <td>{activity.user}</td>
                    <td>{activity.activity}</td>
                    <td>{activity.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminActivity;
