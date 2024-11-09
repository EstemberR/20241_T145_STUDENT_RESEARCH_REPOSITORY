import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './resources/Sidebar';
import Header from './resources/Header';
import { getUserName, getToken } from './resources/Utils';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Dashboard.css';
import '../css/Dashboard2.css';
import '../css/admin_dashboard.css';

const AdminActivity = () => {
  const navigate = useNavigate();
  const [userName] = useState(getUserName());

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
