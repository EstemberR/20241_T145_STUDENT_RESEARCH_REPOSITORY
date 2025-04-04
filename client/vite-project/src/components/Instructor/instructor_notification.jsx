import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './resources/Sidebar';
import Header from './resources/Header';
import { getUserName, getToken } from './resources/Utils';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Dashboard.css';
import '../css/Dashboard2.css';
import '../css/admin_dashboard.css';
import LoadingWithNetworkCheck from '../common/LoadingWithNetworkCheck';

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
        const notificationsResponse = await fetch('http://localhost:8000/instructor/notifications', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!notificationsResponse.ok) {
          const errorData = await notificationsResponse.json();
          console.error('Notifications error:', errorData);
          throw new Error(errorData.message || 'Failed to fetch notifications');
        }

        const notificationsData = await notificationsResponse.json();
        console.log('Received notifications:', notificationsData);
        setNotifications(notificationsData);
      } catch (error) {
        console.error('Error details:', error);
        alert('Error loading data: ' + error.message);
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
          <LoadingWithNetworkCheck />
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
                          <i className={`fas ${
                            notification.type === 'TEAM_REQUEST' ? 'fa-users' : 
                            notification.type === 'RESEARCH_SUBMISSION' ? 'fa-file-alt' : 
                            'fa-bell'
                          } me-2`}></i>
                          <h6 className="mb-1">
                            {notification.type === 'TEAM_REQUEST' ? 'Team Formation Request' : 
                             notification.type === 'RESEARCH_SUBMISSION' ? 'Research Submission' : 
                             'Notification'}
                          </h6>
                          <span className={`ms-2 ${getStatusBadge(notification.status)}`}>
                            {notification.status}
                          </span>
                        </div>
                        <p className="mb-1">{notification.message}</p>
                        <small className="text-muted">
                          {new Date(notification.timestamp).toLocaleString()}
                        </small>
                        {notification.relatedData && (
                          <div className="mt-1">
                            <small className="text-muted">
                              {notification.type === 'TEAM_REQUEST' && notification.relatedData.studentId && (
                                <>Student: {notification.relatedData.studentId.name} ({notification.relatedData.studentId.studentId})</>
                              )}
                              {notification.type === 'RESEARCH_SUBMISSION' && (
                                <>Title: {notification.relatedData.title}<br/>
                                Submitted by: {notification.relatedData.submittedBy}</>
                              )}
                            </small>
                          </div>
                        )}
                      </div>
                      {notification.status === 'UNREAD' && (
                        <div>
                          <button 
                            className="btn btn-success btn-sm me-2"
                            onClick={() => navigate(
                              notification.type === 'TEAM_REQUEST' ? '/instructor/request' :
                              notification.type === 'RESEARCH_SUBMISSION' ? '/instructor/submissions' :
                              '#'
                            )}
                          >
                            View {notification.type === 'TEAM_REQUEST' ? 'Request' : 'Submission'}
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
