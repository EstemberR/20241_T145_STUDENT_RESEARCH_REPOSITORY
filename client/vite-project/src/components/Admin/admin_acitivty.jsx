import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './resources/Sidebar';
import Header from './resources/Header';
import { getUserName, getToken } from './resources/Utils';
import { FaUserGraduate, FaChalkboardTeacher, FaUserTie } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Dashboard.css';
import '../css/Dashboard2.css';
import '../css/admin_dashboard.css';

const AdminActivity = () => {
  const navigate = useNavigate();
  const [userName] = useState(getUserName());
  const [userCounts, setUserCounts] = useState({
    students: 0,
    instructors: 0,
    advisers: 0
  });

  useEffect(() => {
    const token = getToken();
    if (!token) {
      alert('Please log in first.');
      localStorage.removeItem('userName');
      localStorage.removeItem('token');
      navigate('/');
    } else {
      fetch('http://localhost:8000/admin/user-counts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        setUserCounts(data);
      })
      .catch(error => {
        console.error('Error fetching user counts:', error);
      });
    }
  }, [navigate]);

  return (
    <div className="dashboard-container d-flex">
      <Sidebar />
      <div className="main-section col-10 d-flex flex-column">
        <Header userName={userName} />
        <main className="main-content p-4">
          <div className="dashboard-header mb-4">
            <h3 className="text-dark mb-0">User Count Summary</h3>
          </div>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="stat-card h-100 rounded-4 shadow-sm p-4 bg-gradient">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div className="icon-circle bg-primary-subtle">
                    <FaUserGraduate className="text-primary fs-4" />
                  </div>
                  <span className="badge bg-primary-subtle text-primary px-3 py-2 rounded-pill">
                    Students
                  </span>
                </div>
                <h3 className="display-5 fw-bold mb-2">{userCounts.students}</h3>
                <p className="text-muted mb-0">Total Enrolled Students</p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="stat-card h-100 rounded-4 shadow-sm p-4 bg-gradient">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div className="icon-circle bg-info-subtle">
                    <FaChalkboardTeacher className="text-info fs-4" />
                  </div>
                  <span className="badge bg-info-subtle text-info px-3 py-2 rounded-pill">
                    Instructors
                  </span>
                </div>
                <h3 className="display-5 fw-bold mb-2">{userCounts.instructors}</h3>
                <p className="text-muted mb-0">Active Instructors</p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="stat-card h-100 rounded-4 shadow-sm p-4 bg-gradient">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div className="icon-circle bg-success-subtle">
                    <FaUserTie className="text-success fs-4" />
                  </div>
                  <span className="badge bg-success-subtle text-success px-3 py-2 rounded-pill">
                    Advisers
                  </span>
                </div>
                <h3 className="display-5 fw-bold mb-2">{userCounts.advisers}</h3>
                <p className="text-muted mb-0">Research Advisers</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminActivity;
