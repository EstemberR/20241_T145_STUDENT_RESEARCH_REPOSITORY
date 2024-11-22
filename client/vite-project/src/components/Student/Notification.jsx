import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './resources/Sidebar';
import Header from './resources/Header';
import { getUserName, getToken } from './resources/Utils';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Dashboard.css';
import '../css/Notifications.css';
const Notification = () => {
  const navigate = useNavigate();
  const [userName] = useState(getUserName());
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: '' }), 5000);
  };

  useEffect(() => {
    const token = getToken();
    if (!token) {
      showAlert('Please log in first.', 'danger');
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
      showAlert('Error loading notifications', 'danger');
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

      showAlert('Notification marked as read', 'success');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      showAlert(error.message || 'Error updating notification', 'danger');
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      'UNREAD': 'success',
      'READ': 'secondary',
      'APPROVED': 'success',
      'REJECTED': 'danger'
    };
    return `badge bg-${statusColors[status] || 'success'}`;
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
      {alert.show && (
        <div 
          className={`alert alert-${alert.type} alert-dismissible fade show position-fixed`}
          role="alert"
          style={{
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1050,
            minWidth: '300px',
            maxWidth: '500px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}
        >
          {alert.type === 'success' && <i className="fas fa-check-circle me-2"></i>}
          {alert.type === 'danger' && <i className="fas fa-exclamation-circle me-2"></i>}
          {alert.message}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setAlert({ show: false, message: '', type: '' })}
          ></button>
        </div>
      )}

      <Sidebar />
      <div className="main-section col-10 d-flex flex-column">
        <Header userName={userName} />
        <main className="main-content p-4">
          <div className="card shadow-sm">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <h4 className="my-3">NOTIFICATIONS</h4>
              </div>
              <span className="badge bg-success">
                {notifications.filter(n => n.status === 'UNREAD').length} Unread
              </span>
            </div>
            <div className="card-body p-0">
              {notifications.length === 0 ? (
                <div className="text-center p-5">
                  <i className="fas fa-inbox fa-3x text-success mb-3"></i>
                  <h5 className="text-muted">No notifications available</h5>
                </div>
              ) : (
                <div className="notification-list">
                  {notifications.map((notification) => (
                    <div 
                      key={notification._id}
                      className={`notification-item p-3 border-bottom ${
                        notification.status === 'UNREAD' ? 'bg-light-success' : ''
                      }`}
                    >
                      <div className="d-flex align-items-start">
                        <div className={`notification-icon rounded-circle p-2 me-3 bg-${
                          notification.type === 'TEAM_REQUEST' ? 'success' :
                          notification.type === 'RESEARCH_SUBMISSION' ? 'success' :
                          'success'
                        }-subtle`}>
                          <i className={`fas ${
                            notification.type === 'TEAM_REQUEST' ? 'fa-users' :
                            notification.type === 'RESEARCH_SUBMISSION' ? 'fa-file-alt' :
                            'fa-bell'
                          } text-success`}></i>
                        </div>
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <h6 className="mb-0">{notification.message}</h6>
                            <span className={`badge bg-${getStatusBadge(notification.status)} ms-2`}>
                              {notification.status}
                            </span>
                          </div>
                          <small className="text-muted d-block mb-1">
                            <i className="far fa-clock me-1"></i>
                            {new Date(notification.timestamp).toLocaleString()}
                          </small>
                          {notification.type === 'RESEARCH_SUBMISSION' && notification.relatedData && (
                            <div className="mt-2 p-2 bg-light rounded">
                              <small className="text-muted">
                                <i className="fas fa-file-alt me-1"></i>
                                {notification.relatedData.title}
                              </small>
                            </div>
                          )}
                          {notification.status === 'UNREAD' && (
                            <button 
                              className="btn btn-outline-success btn-sm mt-2"
                              onClick={() => handleMarkAsRead(notification._id)}
                            >
                              <i className="fas fa-check me-1"></i>
                              Mark as Read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Notification;
