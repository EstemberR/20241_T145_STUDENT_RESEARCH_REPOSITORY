import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './resources/Sidebar';
import Header from './resources/Header';
import { getUserName, getToken } from './resources/Utils';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Dashboard.css';
import '../css/Dashboard2.css';
import '../css/admin_dashboard.css';

const InstructorStudents = () => {
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
        <main className="main-content ">
        <div className="container mt-4 notify">
            <h4>STUDENT PROFILES</h4>
            <div className="container">
                <div className="row">
                {/* POPULATE */}
                </div>
            </div>
            </div>
        </main>
      </div>
    </div>
  );
};

export default InstructorStudents;
