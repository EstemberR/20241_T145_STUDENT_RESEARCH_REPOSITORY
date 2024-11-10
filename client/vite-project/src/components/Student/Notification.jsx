import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './resources/Sidebar';
import Header from './resources/Header';
import { getUserName, getToken } from './resources/Utils';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Dashboard.css';

const Notification = () => {
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

  // Sample notification data
  const notifications = [
    { id: 1, message: 'Your research submission has been approved.', timestamp: '2024-10-25 10:30 AM' },
    { id: 2, message: 'New guidelines for research submissions are available.', timestamp: '2024-10-26 01:15 PM' },
    { id: 3, message: 'Your profile has been updated successfully.', timestamp: '2024-10-27 08:00 AM' },
    { id: 4, message: 'Reminder: Submit your final project by next week.', timestamp: '2024-10-28 09:00 AM' },
  ];

  return (
    <div className="dashboard-container d-flex">
      <Sidebar />
      <div className="main-section col-10 d-flex flex-column">
        <Header userName={userName} />
        {/*---------------------------------END OF HEADER TEMPLATE----------------------------------------------------*/}
        
        {/* Main Content Area */}
        <main className="main-content p-3">
          <h4 className="mb-3">Notifications</h4>
          <div className="list-group">
            {notifications.map((notification) => (
              <div key={notification.id} className="list-group-item d-flex justify-content-between align-items-start">
                <div className="ms-2 me-auto">
                  <div className="fw-bold">{notification.message}</div>
                  <small className="text-muted">{notification.timestamp}</small>
                </div>
                <button className="search1" style={{ width: "120px", height: "40px"}}>Mark as Read</button>{/* Green-themed button */}
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Notification;
