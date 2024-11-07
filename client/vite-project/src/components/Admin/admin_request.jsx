import casLogo from '../../assets/cas-logo.jpg';
import React, { useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';
import { Link, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Dashboard.css';
import '../css/Dashboard2.css';
import '../css/admin_dashboard.css';

const AdminRequest = () => {
  const location = useLocation();
  const chartRef = useRef(null);
  const totalInstructors = 1;
  const totalAdvisers = 1;
  const pendingRequest = 2;

  const total = pendingRequest;
  useEffect(() => {
    let chartInstance;
    if (chartRef.current) {
      chartInstance = new Chart(chartRef.current, {
        type: 'pie',
        data: {
          labels: ['Instructors', 'Advisers', 'Pending'],
          datasets: [
            {
              data: [totalInstructors, totalAdvisers, pendingRequest],
              backgroundColor: ['#4bc0c0', '#ff6384', '#36a2eb'],
            },
          ],
        },
        options: {
          plugins: {
            tooltip: { enabled: true },
            legend: { display: false },
          },
        },
      });
    }
    return () => {
      if (chartInstance) {
        chartInstance.destroy();
      }
    };
  }, [totalInstructors, totalAdvisers, pendingRequest]);

  return (
    <div className="dashboard-container d-flex">
      {/* Sidebar */}
      <nav className="col-2 sidebar">
        <h3 className="text-center">ADMIN VIEW RESEARCH REPOSITORY</h3>
        <ul className="nav flex-column">
          <li className="nav-item">
          <Link className={`nav-link ${location.pathname === '/admin/admin_dashboard' ? 'active' : ''}`} to="/admin/admin_dashboard">
              <i className="fas fa-tachometer-alt search zx"></i> Admin Dashboard
            </Link>
          </li>
          <li className="nav-item">
            <Link className={`nav-link ${location.pathname === '/admin/repositoryTable' ? 'active' : ''}`} to="/admin/repositoryTable">
              <i className="fas fa-book search zx"></i> Repository Table
            </Link>
          </li>
          <li className="nav-item">
            <Link className={`nav-link ${location.pathname === '/admin/accounts' ? 'active' : ''}`} to="/admin/accounts">
              <i className="fas fa-user search zx"></i> Manage Accounts
            </Link>
          </li>
          <li className="nav-item">
            <Link className={`nav-link ${location.pathname === '/admin/request' ? 'active' : ''}`} to="/admin/request">
              <i className="fas fa-folder-open search zx"></i> Role Requests
            </Link>
          </li>
          <li className="nav-item">
          <Link className={`nav-link ${location.pathname === '/admin/activity' ? 'active' : ''}`} to="/admin/activity">
          <i className="fas fa-robot search zx"></i> User Activity
            </Link>
          </li>
          <li className="nav-item">
            <Link className={`nav-link ${location.pathname === '/admin/report' ? 'active' : ''}`} to="/admin/report">
              <i className="fas fa-bell search zx"></i> Generate Report
            </Link>
          </li>
          <li className="nav-item">
            <Link className={`nav-link ${location.pathname === '/admin/logout' ? 'active' : ''}`} to="/admin/logout">
              <i className="fas fa-sign-out-alt search zx"></i> Logout
            </Link>
          </li>
        </ul>
      </nav>

      {/* Main Section */}
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
{/*========================MAIN============================================================*/}
        <main className="main-content">
        <h4 className="my-3">Role Requests Data</h4>
          <div className="row">
            <div className="col-md-12">
              <div className="card p-3 chartBox">
                <div className="row align-items-center chart-container">
                  {/* Pie Chart Section */}
                  <div className="col-4 d-flex justify-content-center">
                    <div className="position-relative chart-canvas-container">
                      <canvas ref={chartRef} className="chart-canvas"></canvas>
                    </div>
                  </div>
                    <div className="col-8">
                      <div className="row text-center">
                        <div className="col">
                        <div className="row chartText">
                          <h6 className="">Total Instructors</h6>
                          <span className="teal">{totalInstructors}</span>
                        </div>
                        <div className="row chartText">
                          <h6>Total Advisers</h6>
                          <span className="red">{totalAdvisers}</span>
                        </div>
                        </div>
                        <div className="col">
                        <div className="row chartText">
                          <h6>Total Count</h6>
                          <span className="yellow">{pendingRequest}</span>
                        </div>
                        <div className="row chartText">
                          <h6>Pending Requests</h6>
                          <span className="totality">{total}</span>
                        </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            <div>
            <table className="table table-green-theme table-striped table-bordered mt-3">
              <thead className="table-primary">
                <tr>
                  <th className="centering">ID</th>
                  <th className="centering">Name</th>
                  <th className="centering">Email</th>
                  <th className="centering">Date Requested</th>
                  <th className="centering">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="centering">1</td>
                  <td className="centering">Jane Doe</td>
                  <td className="centering">janedoe@email.com</td>
                  <td className="centering">2024-11-06</td>
                  <td className="centering">
                  <button className="btn btn-success btn-sm ms-2">
                            <i className="fas fa-check"></i> Accept
                          </button>
                          <button className="btn btn-danger btn-sm ms-2">
                            <i className="fas fa-times"></i> Reject
                          </button>
                  </td>
                </tr>
                <tr>
                  <td className="centering">2</td>
                  <td className="centering">John Smith</td>
                  <td className="centering">johnsmith@email.com</td>
                  <td className="centering">2024-11-05</td>
                  <td className="centering">
                  <button className="btn btn-success btn-sm ms-2">
                            <i className="fas fa-check"></i> Accept
                          </button>
                          <button className="btn btn-danger btn-sm ms-2">
                            <i className="fas fa-times"></i> Reject
                          </button>
                  </td>
                </tr>
              </tbody>
            </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminRequest;
