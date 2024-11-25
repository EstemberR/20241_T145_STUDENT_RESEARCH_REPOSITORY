import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Sidebar from './resources/Sidebar';
import Header from './resources/Header';
import { getUserName, getToken } from './resources/Utils';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Dashboard.css';
import '../css/Dashboard2.css';
import '../css/admin_dashboard.css';

const InstructorDashboard = () => {
  const navigate = useNavigate();
  const [userName] = useState(getUserName());
  const [userRole, setUserRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    notifications: [],
    researchStats: {
      reviewed: 0,
      pending: 0,
      rejected: 0
    },
    recentSubmissions: [],
    studentStats: {
      total: 0,
      withTeams: 0,
      withoutTeams: 0
    },
    recentTeamRequests: []
  });
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: '' }), 5000);
  };

  const fetchDashboardData = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) throw new Error('No token found');

      const [profileRes, notificationsRes, submissionsRes, studentsRes, teamRequestsRes] = await Promise.all([
        fetch('http://localhost:8000/instructor/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:8000/instructor/notifications', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:8000/instructor/submissions', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:8000/instructor/students', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:8000/instructor/team-requests', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const [profile, notifications, submissions, students, teamRequests] = await Promise.all([
        profileRes.json(),
        notificationsRes.json(),
        submissionsRes.json(),
        studentsRes.json(),
        teamRequestsRes.json()
      ]);

      console.log('Team Requests Data:', teamRequests);

      setDashboardData({
        notifications: notifications.slice(0, 5),
        researchStats: {
          reviewed: submissions.filter(s => s.status === 'Accepted').length,
          pending: submissions.filter(s => s.status === 'Pending').length,
          rejected: submissions.filter(s => s.status === 'Rejected').length
        },
        recentSubmissions: submissions.slice(0, 5),
        studentStats: {
          total: students.length,
          withTeams: students.filter(s => s.teamId).length,
          withoutTeams: students.filter(s => !s.teamId).length
        },
        recentTeamRequests: teamRequests.slice(0, 5)
      });

      setUserRole(profile.role);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showAlert('Error fetching dashboard data', 'danger');
    } finally {
      setLoading(false);
    }
  }, []);

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

  const formatTeamMembers = (teamMembers) => {
    if (!teamMembers || !Array.isArray(teamMembers)) return 'No members';
    return teamMembers
      .map(member => `${member.name} (${member.studentId})`)
      .join(', ');
  };

  if (loading) {
    return (
      <div className="dashboard-container d-flex">
        <Sidebar />
        <div className="main-section col-10 d-flex flex-column">
          <Header userName={userName} userRole={userRole} />
          <div className="text-center p-5">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container d-flex">
      <Sidebar />
      <div className="main-section col-10 d-flex flex-column">
        <Header userName={userName} userRole={userRole} />
        {alert.show && (
          <div className={`alert alert-${alert.type} alert-dismissible fade show m-3`}>
            {alert.message}
            <button type="button" className="btn-close" onClick={() => setAlert({ show: false })}></button>
          </div>
        )}

        <main className="main-content p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="mb-0">Dashboard Overview</h4>
            <button 
              className="btn btn-outline-primary btn-sm"
              onClick={fetchDashboardData}
            >
              <i className="fas fa-sync-alt me-2"></i>
              Refresh
            </button>
          </div>

          {/* Stats Cards */}
          <div className="row mb-4">
            <div className="col-md-3">
              <div className="card bg-success bg-opacity-10 border-0">
                <div className="card-body text-center">
                  <i className="fas fa-check-circle fa-2x text-success mb-3"></i>
                  <h3 className="text-success">{dashboardData.researchStats.reviewed}</h3>
                  <p className="text-muted mb-0">Reviewed Papers</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-warning bg-opacity-10 border-0">
                <div className="card-body text-center">
                  <i className="fas fa-clock fa-2x text-warning mb-3"></i>
                  <h3 className="text-warning">{dashboardData.researchStats.pending}</h3>
                  <p className="text-muted mb-0">Pending Review</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-danger bg-opacity-10 border-0">
                <div className="card-body text-center">
                  <i className="fas fa-times-circle fa-2x text-danger mb-3"></i>
                  <h3 className="text-danger">{dashboardData.researchStats.rejected}</h3>
                  <p className="text-muted mb-0">Rejected Papers</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-info bg-opacity-10 border-0">
                <div className="card-body text-center">
                  <i className="fas fa-users fa-2x text-info mb-3"></i>
                  <h3 className="text-info">{dashboardData.studentStats.total}</h3>
                  <p className="text-muted mb-0">Total Students</p>
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
                      dashboardData.notifications.map((notification) => (
                        <div key={notification._id} className="notification-item p-3 border-bottom">
                          <div className="d-flex align-items-start">
                            <div className={`notification-icon rounded-circle p-2 me-3 bg-${
                              notification.type === 'TEAM_REQUEST' ? 'primary' :
                              notification.type === 'RESEARCH_SUBMISSION' ? 'success' :
                              'info'
                            }-subtle`}>
                              <i className={`fas ${
                                notification.type === 'TEAM_REQUEST' ? 'fa-users' :
                                notification.type === 'RESEARCH_SUBMISSION' ? 'fa-file-alt' :
                                'fa-bell'
                              } text-success`}></i>
                            </div>
                            <div className="flex-grow-1">
                              <p className="mb-1">{notification.message}</p>
                              <small className="text-muted">
                                <i className="far fa-clock me-1"></i>
                                {new Date(notification.timestamp).toLocaleString()}
                              </small>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="text-center mt-3">
                    <Link to="/instructor/notification" className="btn btn-sm btn-outline-primary">
                      View All Notifications
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Team Requests */}
            <div className="col-md-8 mb-4">
              <div className="card shadow-sm h-100">
                <div className="card-header bg-white">
                  <h5 className="mb-0">
                    <i className="fas fa-users me-2 text-success"></i>
                    Recent Team Formation Requests
                  </h5>
                </div>
                <div className="card-body">
                  {dashboardData.recentTeamRequests.length === 0 ? (
                    <div className="text-center p-4">
                      <i className="fas fa-users fa-2x text-muted mb-3"></i>
                      <p className="text-muted">No pending team requests</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Team Leader</th>
                            <th>Members</th>
                            <th>Section</th>
                            <th>Status</th>
                            <th>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dashboardData.recentTeamRequests.map(request => (
                            <tr key={request._id}>
                              <td>
                                <div className="d-flex align-items-center">
                                  <div>
                                    <p className="mb-0">{request.relatedData?.studentId?.name || 'Unknown'}</p>
                                    <small className="text-muted">{request.relatedData?.studentId?.studentId || ''}</small>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <small>
                                  {formatTeamMembers(request.relatedData?.teamMembers)}
                                </small>
                              </td>
                              <td>{request.relatedData?.studentId?.section || 'N/A'}</td>
                              <td>
                                <span className={`badge bg-${
                                  request.status === 'UNREAD' ? 'warning' :
                                  request.status === 'APPROVED' ? 'success' :
                                  request.status === 'REJECTED' ? 'danger' :
                                  'secondary'
                                }`}>
                                  {request.status}
                                </span>
                              </td>
                              <td>
                                <small>
                                  {new Date(request.timestamp).toLocaleDateString()}
                                </small>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="text-center mt-3">
                        <Link to="/instructor/request" className="btn btn-sm btn-outline-success">
                          View All Requests
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

export default InstructorDashboard;
