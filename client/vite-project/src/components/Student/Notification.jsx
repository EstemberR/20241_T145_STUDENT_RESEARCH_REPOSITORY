import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './resources/Sidebar';
import Header from './resources/Header';
import { getUserName, getToken } from './resources/Utils';
import LoadingWithNetworkCheck from '../common/LoadingWithNetworkCheck';
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
          <LoadingWithNetworkCheck />
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container d-flex">
      <Sidebar />
      <div className="main-section col-10">
        <Header userName={userName} />
        <main className="p-4">
          <div className="mb-4">
            <h4>NOTIFICATIONS</h4>
          </div>
          <div className="card shadow-sm">
            <div className="card-body">
              {notifications.length === 0 ? (
                <div className="text-center p-5">
                  <i className="fas fa-bell-slash fa-3x text-muted mb-3"></i>
                  <p className="text-muted">No notifications yet</p>
                </div>
              ) : (
                <div className="notification-list">
                  {notifications.map((notification) => (
                    <div key={notification._id} className="notification-item p-3 border-bottom">
                      <div className="d-flex align-items-start">
                        <div className={`notification-icon rounded-circle p-2 me-3 bg-${
                          notification.type === 'TEAM_REQUEST' ? 'primary' :
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
                          </div>
                          <small className="text-muted d-block mb-1">
                            <i className="far fa-clock me-1"></i>
                            {new Date(notification.timestamp).toLocaleString()}
                          </small>
                          {notification.type === 'RESEARCH_SUBMISSION' && notification.relatedData && (
                            <div className="mt-2 p-2 bg-light rounded">
                              <p className="mb-1"><strong>Research:</strong> {notification.relatedData.title}</p>
                              {notification.relatedData.revisionNote && (
                                <div className="mt-2">
                                  <strong>Revision Instructions:</strong>
                                  <p className="text-muted mb-0">{notification.relatedData.revisionNote}</p>
                                </div>
                              )}
                            </div>
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
