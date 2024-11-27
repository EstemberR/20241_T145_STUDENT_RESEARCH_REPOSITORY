import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './resources/Sidebar';
import Header from './resources/Header';
import { getUserName, getToken } from './resources/Utils';
import { FaUserGraduate, FaChalkboardTeacher, FaUserTie } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../components/css/Dashboard.css';
import '../css/admin_dashboard.css';

const superAdminActivity = () => {
  const navigate = useNavigate();
  const [userName] = useState(getUserName());
  const [userCounts, setUserCounts] = useState({
    students: 0,
    instructors: 0,
    advisers: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserCounts = async () => {
      try {
        const token = getToken();
        if (!token) {
          navigate('/');
          return;
        }

        const response = await fetch('http://localhost:8000/admin/user-counts', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user counts');
        }

        const data = await response.json();
        setUserCounts(data);
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to load user counts');
      } finally {
        setLoading(false);
      }
    };

    fetchUserCounts();
  }, [navigate]);

  if (loading) {
    return (
      <div className="dashboard-container d-flex">
        <Sidebar />
        <div className="main-section col-10 d-flex flex-column">
          <Header userName={userName} />
          <div className="d-flex justify-content-center align-items-center h-100">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container d-flex">
      <Sidebar />
      <div className="main-section col-10 d-flex flex-column">
        <Header userName={userName} />

        <main className="main-content">
            <h4 className="my-3">USER ACTIVITY</h4>
            
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            <div className="row g-4">
              {/* Students Card */}
              <div className="col-md-4">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body d-flex align-items-center">
                    <div className="rounded-circle p-3 bg-primary bg-opacity-10 me-3">
                      <FaUserGraduate size={30} className="text-primary" />
                    </div>
                    <div>
                      <h6 className="card-title text-muted mb-0">Total Students</h6>
                      <h2 className="mt-2 mb-0">{userCounts.students}</h2>
                    </div>
                  </div>
                </div>
              </div>

              {/* Instructors Card */}
              <div className="col-md-4">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body d-flex align-items-center">
                    <div className="rounded-circle p-3 bg-success bg-opacity-10 me-3">
                      <FaChalkboardTeacher size={30} className="text-success" />
                    </div>
                    <div>
                      <h6 className="card-title text-muted mb-0">Total Instructors</h6>
                      <h2 className="mt-2 mb-0">{userCounts.instructors}</h2>
                    </div>
                  </div>
                </div>
              </div>

              {/* Advisers Card */}
              <div className="col-md-4">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body d-flex align-items-center">
                    <div className="rounded-circle p-3 bg-warning bg-opacity-10 me-3">
                      <FaUserTie size={30} className="text-warning" />
                    </div>
                    <div>
                      <h6 className="card-title text-muted mb-0">Total Advisers</h6>
                      <h2 className="mt-2 mb-0">{userCounts.advisers}</h2>
                    </div>
                  </div>
                </div>
              </div>
            </div>

        </main>
      </div>
    </div>
  );
};

export default superAdminActivity;
