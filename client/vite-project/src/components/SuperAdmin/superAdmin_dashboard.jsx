import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './resources/Sidebar';
import Header from './resources/Header';
import { getUserName, getToken } from './resources/Utils';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Dashboard.css';
import '../css/Dashboard2.css';
import '../css/admin_dashboard.css';

const superAdminDashboard = () => {
  const navigate = useNavigate();
  const [userName] = useState(getUserName());

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
          <div className="contentRow d-flex align-items-start">
            <div className="notificationDashboard">
              <h4 className="researchLabel2">Generate Report</h4>
              <div className="staticData">[]</div>
            </div>
            <div className="researchDashboard">
              <h4 className="researchLabel2">Repository Table Submissions</h4>
              <div className="researchOverviewContainer">
                <div className="researchBox1">PUBLISHED
                  <p>[]</p>
                </div>
                <div className="researchBox2">PENDING
                  <p>[]</p>
                </div>
                <div className="researchBox3">REJECTED
                  <p>[]</p>
                </div>
              </div>
            </div>
          </div>

          <div className="repositoryDashboards">
            <div className="repositoryOverviewContainer d-flex">
              <div className="repoBox">
                <p className="repoData">[MANAGE ACCOUNTS]</p>
              </div>
              <div className="repoBox">
                <p className="repoData">[ROLE REQUESTS]</p>
              </div>
              <div className="repoBox">
                <p className="repoData">[USER ACTIVITY]</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default superAdminDashboard;
