import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './resources/Sidebar';
import Header from './resources/Header';
import { getUserName, getToken } from './resources/Utils';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Dashboard.css';
import '../css/Dashboard2.css';
import '../css/admin_dashboard.css';


const InstructorNotification = () => {
  const navigate = useNavigate();
  const [userName] = useState(getUserName());
  const [userRole, setUserRole] = useState([]);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
    const token = getToken();
    if (!token) {
      alert('Please log in first.');
      localStorage.removeItem('userName');
      localStorage.removeItem('token');
      navigate('/');
      return;
    }
    
    const response = await fetch('http://localhost:8000/instructor/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    if (response.ok) {
      setUserRole(data.role);
    }
  } catch (error) {
    console.error('Error fetching user role:', error);
  }
};

fetchUserRole();
  }, [navigate]);
  return (
    <div className="dashboard-container d-flex">
      <Sidebar />
      <div className="main-section col-10 d-flex flex-column">
      <Header userName={userName} userRole={userRole} />

        <main className="main-content">
          <div className="container mt-4 notify">
            <h4 className="mb-3">NOTIFICATIONS</h4>
            <div className="list-group">
              {/* Notification 1 */}
              <div className="list-group-item list-group-item-action mb-2">
                <div className="d-flex justify-content-between">
                  <div>
                    <h6 className="mb-1">New Research Submission</h6>
                    <p className="mb-1">You have a new research submission from John Doe.</p>
                  </div>
                  <span className="badge badge-primary">New</span>
                </div>
                <small>2 hours ago</small>
              </div>

              {/* Notification 2 */}
              <div className="list-group-item list-group-item-action mb-2">
                <div className="d-flex justify-content-between">
                  <div>
                    <h6 className="mb-1">Meeting Reminder</h6>
                    <p className="mb-1">Reminder for your meeting with student Sarah on Wednesday at 10 AM.</p>
                  </div>
                  <span className="badge badge-warning">Pending</span>
                </div>
                <small>1 day ago</small>
              </div>

              {/* Notification 3 */}
              <div className="list-group-item list-group-item-action mb-2">
                <div className="d-flex justify-content-between">
                  <div>
                    <h6 className="mb-1">Research Review Request</h6>
                    <p className="mb-1">Your review is requested for research submission titled "AI in Education".</p>
                  </div>
                  <span className="badge badge-success">Reviewed</span>
                </div>
                <small>3 days ago</small>
              </div>

              {/* Notification 4 */}
              <div className="list-group-item list-group-item-action mb-2">
                <div className="d-flex justify-content-between">
                  <div>
                    <h6 className="mb-1">New Course Material</h6>
                    <p className="mb-1">New course material has been uploaded for your course: "Introduction to Programming".</p>
                  </div>
                  <span className="badge badge-info">Info</span>
                </div>
                <small>5 days ago</small>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default InstructorNotification;
