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
  const [userRole, setUserRole] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getToken();
        if (!token) {
          alert('Please log in first.');
          localStorage.removeItem('userName');
          localStorage.removeItem('token');
          navigate('/');
          return;
        }

        // Fetch user role
        const profileResponse = await fetch('http://localhost:8000/instructor/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const profileData = await profileResponse.json();
        if (profileResponse.ok) {
          setUserRole(profileData.role);
        }

        // Fetch notifications
        const notificationsResponse = await fetch('http://localhost:8000/instructor/team-requests', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!notificationsResponse.ok) {
          throw new Error('Failed to fetch notifications');
        }

        const notificationsData = await notificationsResponse.json();
        setNotifications(notificationsData);
      } catch (error) {
        console.error('Error:', error);
        alert('Error loading data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

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
          <Header userName={userName} userRole={userRole} />
          <main className="main-content">
            <div className="text-center mt-4">
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
        <Header userName={userName} userRole={userRole} />
        <main className="main-content">
          <div className="container mt-4 notify">
            <h4 className="mb-3">NOTIFICATIONS</h4>
            {notifications.length === 0 ? (
              <div className="alert alert-info">No notifications available.</div>
            ) : (
              <div className="list-group">
                {notifications.map((notification) => (
                  <div key={notification._id} 
                       className={`list-group-item list-group-item-action mb-2 ${notification.status === 'UNREAD' ? 'bg-light' : ''}`}>
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="ms-2 me-auto">
                        <div className="d-flex align-items-center mb-1">
                          <h6 className="mb-1">Team Formation Request</h6>
                          <span className={`ms-2 ${getStatusBadge(notification.status)}`}>
                            {notification.status}
                          </span>
                        </div>
                        <p className="mb-1">{notification.message}</p>
                        <small className="text-muted">
                          {new Date(notification.timestamp).toLocaleString()}
                        </small>
                        {notification.relatedData?.studentId && (
                          <div className="mt-1">
                            <small className="text-muted">
                              Student: {notification.relatedData.studentId.name} ({notification.relatedData.studentId.studentId})
                            </small>
                          </div>
                        )}
                      </div>
                      {notification.status === 'UNREAD' && (
                        <div>
                          <button 
                            className="btn btn-success btn-sm me-2"
                            onClick={() => navigate('/instructor/request')}
                          >
                            View Request
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default InstructorNotification;
