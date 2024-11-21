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
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      alert('Please log in first.');
      localStorage.removeItem('userName');
      localStorage.removeItem('token');
      navigate('/');
    } else {
      fetchNotifications();
    }
  }, [navigate]);

  const fetchNotifications = async () => {
    try {
      const token = getToken();
      const response = await fetch('http://localhost:8000/student/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      alert('Error loading notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      const token = getToken();
      const response = await fetch(`http://localhost:8000/student/notifications/${notificationId}/mark-read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to mark notification as read');
      }

      // Update the notifications list immediately
      setNotifications(prevNotifications =>
        prevNotifications.map(notif =>
          notif._id === notificationId
            ? { ...notif, status: 'READ' }
            : notif
        )
      );

    } catch (error) {
      console.error('Error marking notification as read:', error);
      alert(error.message);
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      'UNREAD': 'warning',
      'READ': 'secondary',
      'APPROVED': 'success',
      'REJECTED': 'danger'
    };
    return `badge bg-${statusColors[status] || 'primary'}`;
  };

  if (loading) {
    return (
      <div className="dashboard-container d-flex">
        <Sidebar />
        <div className="main-section col-10 d-flex flex-column">
          <Header userName={userName} />
          <main className="main-content p-3">
            <div className="text-center">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container d-flex">
      <Sidebar />
      <div className="main-section col-10 d-flex flex-column">
        <Header userName={userName} />
        <main className="main-content p-3">
          <h4 className="mb-3">Notifications</h4>
          {notifications.length === 0 ? (
            <div className="alert alert-info">No notifications available.</div>
          ) : (
            <div className="list-group">
              {notifications.map((notification) => (
                <div key={notification._id} 
                     className={`list-group-item d-flex justify-content-between align-items-start ${notification.status === 'UNREAD' ? 'bg-light' : ''}`}>
                  <div className="ms-2 me-auto">
                    <div className="d-flex align-items-center mb-1">
                      <div className="fw-bold">{notification.message}</div>
                      <span className={`ms-2 ${getStatusBadge(notification.status)}`}>
                        {notification.status}
                      </span>
                    </div>
                    <small className="text-muted">
                      {new Date(notification.timestamp).toLocaleString()}
                    </small>
                  </div>
                  {notification.status === 'UNREAD' && (
                    <button 
                      className="search1" 
                      style={{ width: "120px", height: "40px"}}
                      onClick={() => handleMarkAsRead(notification._id)}
                    >
                      Mark as Read
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Notification;
