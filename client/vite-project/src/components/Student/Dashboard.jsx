import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Sidebar from './resources/Sidebar';
import Header from './resources/Header';
import { getUserName, getToken } from './resources/Utils';
import LoadingWithNetworkCheck from '../common/LoadingWithNetworkCheck';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Dashboard.css';
import '../css/Dashboard2.css';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [userName] = useState(getUserName());
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    notifications: [],
    researchStats: {
      reviewed: 0,
      pending: 0,
      rejected: 0,
      revision: 0
    },
    recentResearch: [],
    teamStatus: null,
    upcomingDeadlines: []
  });
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
  const [hasTeam, setHasTeam] = useState(false);
  const [teamInfo, setTeamInfo] = useState(null);

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: '' }), 5000);
  };

  const fetchDashboardData = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) throw new Error('No token found');

      // Fetch notifications first
      const notificationsRes = await fetch('http://localhost:8000/student/notifications', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Check if the response is ok and is JSON
      if (!notificationsRes.ok) {
        const contentType = notificationsRes.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await notificationsRes.json();
          throw new Error(errorData.message || 'Failed to fetch notifications');
        } else {
          throw new Error('Network response was not ok');
        }
      }

      let notifications = [];
      try {
        notifications = await notificationsRes.json();
      } catch (e) {
        console.error('Error parsing notifications:', e);
        notifications = [];
      }

      // Update repository fetch to use all-research endpoint instead
      const [researchRes, repositoryRes, teamStatusRes, deadlinesRes] = await Promise.all([
        fetch('http://localhost:8000/student/research', {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch('http://localhost:8000/student/all-research', {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch('http://localhost:8000/student/check-team-status', {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch('http://localhost:8000/student/deadlines', {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      // Parse responses
      const research = await (researchRes.ok ? researchRes.json() : []);
      let repository = await (repositoryRes.ok ? repositoryRes.json() : []);
      const teamStatus = await (teamStatusRes.ok ? teamStatusRes.json() : {});
      const deadlines = await (deadlinesRes.ok ? deadlinesRes.json() : []);

      // Filter accepted research and sort by date
      repository = repository
        .filter(r => r.status === 'Accepted')
        .sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));

      console.log('Recent research loaded:', repository); // Debug log

      setDashboardData({
        notifications: notifications,
        researchStats: {
          reviewed: research.filter(r => r.status === 'Accepted').length,
          pending: research.filter(r => r.status === 'Pending').length,
          rejected: research.filter(r => r.status === 'Rejected').length,
          revision: research.filter(r => r.status === 'Revision').length
        },
        recentResearch: repository.slice(0, 5), // Take only the 5 most recent
        teamStatus,
        upcomingDeadlines: deadlines
      });

    } catch (error) {
      console.error('Detailed error:', error);
      showAlert(`Error fetching dashboard data: ${error.message}`, 'danger');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    const token = getToken();
    if (!token) {
      showAlert('Please log in first.', 'danger');
      localStorage.removeItem('userName');
      localStorage.removeItem('token');
      navigate('/');
    } else {
      fetchDashboardData();
    }
  }, [navigate, fetchDashboardData]);

  // Set up periodic refresh
  useEffect(() => {
    const interval = setInterval(fetchDashboardData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchDashboardData, refreshInterval]);

  // Handle manual refresh
  const handleManualRefresh = async () => {
    setLoading(true);
    await fetchDashboardData();
  };

  // Add this function to check team status
  const checkTeamStatus = async () => {
    try {
      const token = getToken();
      const response = await fetch('http://localhost:8000/student/check-team-status', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      setHasTeam(data.hasApprovedTeam);
      setTeamInfo(data);
    } catch (error) {
      console.error('Error checking team status:', error);
      showAlert('Error checking team status', 'danger');
    }
  };

  // Add this to your useEffect
  useEffect(() => {
    checkTeamStatus();
  }, []);

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
      <div className="main-section col-10 d-flex flex-column">
        <Header userName={userName} />
        {alert.show && (
          <div className={`alert alert-${alert.type} alert-dismissible fade show m-3`}>
            {alert.message}
            <button type="button" className="btn-close" onClick={() => setAlert({ show: false })}></button>
          </div>
        )}

        <main className="main-content p-4">
          {/* Team Status Alert */}
          {!hasTeam && (
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-warning text-dark">
                <h5 className="mb-0">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  Team Required
                </h5>
              </div>
              <div className="card-body">
                <p className="mb-3">You need to form a team before you can submit research papers.</p>
                <Link to="/manage-members" className="btn btn-primary">
                  <i className="fas fa-users me-2"></i>
                  Manage Team Members
                </Link>
              </div>
            </div>
          )}

          {/* Upcoming Deadlines */}
          {dashboardData.upcomingDeadlines.length > 0 && (
            <div className="alert alert-info mb-4">
              <i className="fas fa-calendar-alt me-2"></i>
              <strong>Upcoming Deadline:</strong> {dashboardData.upcomingDeadlines[0].description} - 
              {new Date(dashboardData.upcomingDeadlines[0].date).toLocaleDateString()}
            </div>
          )}

          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="mb-0">Dashboard Overview</h4>
            <button 
              className="btn btn-outline-primary btn-sm" 
              onClick={handleManualRefresh}
              disabled={loading}
            >
              <i className="fas fa-sync-alt me-2"></i>
              Refresh
            </button>
          </div>

          <div className="row">
            {/* Stats Cards */}
            <div className="col-md-3 mb-4">
              <div className="card bg-success bg-opacity-10 border-0">
                <div className="card-body text-center">
                  <i className="fas fa-check-circle fa-2x text-success mb-3"></i>
                  <h3 className="text-success">{dashboardData.researchStats.reviewed}</h3>
                  <p className="text-muted mb-0">Approved Research</p>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-4">
              <div className="card bg-warning bg-opacity-10 border-0">
                <div className="card-body text-center">
                  <i className="fas fa-clock fa-2x text-warning mb-3"></i>
                  <h3 className="text-warning">{dashboardData.researchStats.pending}</h3>
                  <p className="text-muted mb-0">Pending Review</p>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-4">
              <div className="card bg-info bg-opacity-10 border-0">
                <div className="card-body text-center">
                  <i className="fas fa-edit fa-2x text-info mb-3"></i>
                  <h3 className="text-info">{dashboardData.researchStats.revision}</h3>
                  <p className="text-muted mb-0">Needs Revision</p>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-4">
              <div className="card bg-danger bg-opacity-10 border-0">
                <div className="card-body text-center">
                  <i className="fas fa-times-circle fa-2x text-danger mb-3"></i>
                  <h3 className="text-danger">{dashboardData.researchStats.rejected}</h3>
                  <p className="text-muted mb-0">Rejected</p>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            {/* Notifications Card */}
            <div className="col-md-4 mb-4">
              <div className="card shadow-sm h-100">
                <div className="card-header bg-white d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    <i className="fas fa-bell me-2 text-primary"></i>
                    Recent Notifications
                  </h5>
                  <span className="badge bg-primary">
                    {dashboardData.notifications.filter(n => n.status === 'UNREAD').length}
                  </span>
                </div>
                <div className="card-body">
                  <div className="notification-list">
                    {dashboardData.notifications.length === 0 ? (
                      <div className="text-center p-3">
                        <i className="fas fa-bell-slash fa-2x text-muted mb-2"></i>
                        <p className="text-muted mb-0">No notifications yet</p>
                      </div>
                    ) : (
                      dashboardData.notifications.slice(0, 5).map((notification) => (
                        <div key={notification._id} className="notification-item p-2 border-bottom">
                          <div className="d-flex align-items-start">
                            <div className={`notification-icon rounded-circle p-2 me-2 bg-${
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
                              <p className="mb-1 notification-message">{notification.message}</p>
                              <small className="text-muted">
                                <i className="far fa-clock me-1"></i>
                                {new Date(notification.timestamp).toLocaleString()}
                              </small>
                              {notification.type === 'RESEARCH_SUBMISSION' && notification.relatedData && (
                                <div className="mt-2 p-2 bg-light rounded">
                                  <small className="d-block"><strong>Research:</strong> {notification.relatedData.title}</small>
                                  {notification.relatedData.revisionNote && (
                                    <small className="d-block text-muted mt-1">
                                      <strong>Revision Note:</strong> {notification.relatedData.revisionNote}
                                    </small>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="text-center mt-3">
                    <Link to="/student/notifications" className="btn btn-sm btn-outline-primary">
                      View All Notifications
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Research Card */}
            <div className="col-md-8 mb-4">
              <div className="card shadow-sm h-100">
                <div className="card-header bg-white">
                  <h5 className="mb-0">
                    <i className="fas fa-book me-2 text-success"></i>
                    Recent Research Papers
                  </h5>
                </div>
                <div className="card-body">
                  {dashboardData.recentResearch.length === 0 ? (
                    <div className="text-center p-4">
                      <i className="fas fa-book-open fa-2x text-muted mb-3"></i>
                      <p className="text-muted">No research papers available yet</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Title</th>
                            <th>Authors</th>
                            <th>Status</th>
                            <th>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dashboardData.recentResearch.map(research => (
                            <tr key={research._id}>
                              <td>{research.title}</td>
                              <td>{research.authors}</td>
                              <td>
                                <span className={`badge bg-${
                                  research.status === 'Accepted' ? 'success' :
                                  research.status === 'Pending' ? 'warning' :
                                  research.status === 'Revision' ? 'info' : 'danger'
                                }`}>
                                  {research.status}
                                </span>
                              </td>
                              <td>{new Date(research.uploadDate).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="text-center mt-3">
                        <Link to="/student/repository" className="btn btn-sm btn-outline-success">
                          View All Research
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;
