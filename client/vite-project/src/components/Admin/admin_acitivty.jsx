import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import Sidebar from './resources/Sidebar';
import Header from './resources/Header';
import { getUserName, getToken } from './resources/Utils';
import { 
  FaUserGraduate, 
  FaChalkboardTeacher, 
  FaUserTie, 
  FaUsers, 
  FaFileAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaClock
} from 'react-icons/fa';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const AdminActivity = () => {
  const navigate = useNavigate();
  const [userName] = useState(getUserName());
  const [userCounts, setUserCounts] = useState({
    students: 0,
    instructors: 0,
    activeUsers: 0,
    totalUsers: 0
  });
  
  // Add activityStats state
  const [activityStats, setActivityStats] = useState({
    totalSubmissions: 0,
    pendingSubmissions: 0,
    approvedSubmissions: 0,
    rejectedSubmissions: 0
  });

  // Add recentActivity state
  const [recentActivity, setRecentActivity] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getToken();
        if (!token) {
          navigate('/');
          return;
        }

        // Fetch user counts
        const response = await fetch('http://localhost:8000/admin/user-counts', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        const data = await response.json();
        const totalUsers = data.students + data.instructors;
        
        setUserCounts({
          students: data.students || 0,
          instructors: data.instructors || 0,
          activeUsers: totalUsers,
          totalUsers: totalUsers
        });

        // Set some dummy data for activity stats
        setActivityStats({
          totalSubmissions: 25,
          pendingSubmissions: 5,
          approvedSubmissions: 15,
          rejectedSubmissions: 5
        });

        // Set some dummy recent activity data
        setRecentActivity([
          {
            type: 'submission',
            description: 'New research paper submitted',
            timestamp: new Date()
          },
          {
            type: 'registration',
            description: 'New student registered',
            timestamp: new Date(Date.now() - 86400000) // 1 day ago
          },
          {
            type: 'approval',
            description: 'Research paper approved',
            timestamp: new Date(Date.now() - 172800000) // 2 days ago
          }
        ]);

      } catch (err) {
        console.error('Error:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // Sample data for the chart
  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Students',
        data: [userCounts.students - 5, userCounts.students - 3, userCounts.students - 2, 
               userCounts.students - 1, userCounts.students],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      },
      {
        label: 'Instructors',
        data: [userCounts.instructors - 2, userCounts.instructors - 1, userCounts.instructors, 
               userCounts.instructors, userCounts.instructors],
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1
      }
    ]
  };

  if (loading) {
    return (
      <div className="dashboard-container d-flex">
        <Sidebar />
        <div className="main-section col-10 d-flex flex-column">
          <Header userName={userName} />
          <div className="d-flex justify-content-center align-items-center h-100">
            <div className="spinner-border text-primary" role="status">
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
        <Header userName={userName} />

        <main className="main-content p-4">
          <h4 className="mb-4">USER ACTIVITY DASHBOARD</h4>
            
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {/* User Statistics Row */}
          <div className="row g-4 mb-4">
            <div className="col-md-3">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body d-flex align-items-center">
                  <div className="rounded-circle p-3 bg-primary bg-opacity-10 me-3">
                    <FaUserGraduate size={30} className="text-primary" />
                  </div>
                  <div>
                    <h6 className="card-title text-muted mb-0">Total Students</h6>
                    <h2 className="mt-2 mb-0">{userCounts.students}</h2>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body d-flex align-items-center">
                  <div className="rounded-circle p-3 bg-success bg-opacity-10 me-3">
                    <FaChalkboardTeacher size={30} className="text-success" />
                  </div>
                  <div>
                    <h6 className="card-title text-muted mb-0">Total Instructors</h6>
                    <h2 className="mt-2 mb-0">{userCounts.instructors}</h2>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body d-flex align-items-center">
                  <div className="rounded-circle p-3 bg-info bg-opacity-10 me-3">
                    <FaUsers size={30} className="text-info" />
                  </div>
                  <div>
                    <h6 className="card-title text-muted mb-0">Active Users</h6>
                    <h2 className="mt-2 mb-0">{userCounts.activeUsers}</h2>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body d-flex align-items-center">
                  <div className="rounded-circle p-3 bg-warning bg-opacity-10 me-3">
                    <FaUserTie size={30} className="text-warning" />
                  </div>
                  <div>
                    <h6 className="card-title text-muted mb-0">Total Users</h6>
                    <h2 className="mt-2 mb-0">{userCounts.totalUsers}</h2>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Research Activity Statistics */}
          <div className="row g-4 mb-4">
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body">
                  <h6 className="card-title mb-4">Research Submissions</h6>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <FaFileAlt className="text-primary me-2" />
                      Total Submissions
                    </div>
                    <span className="badge bg-primary">{activityStats.totalSubmissions}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <FaClock className="text-warning me-2" />
                      Pending Review
                    </div>
                    <span className="badge bg-warning">{activityStats.pendingSubmissions}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <FaCheckCircle className="text-success me-2" />
                      Approved
                    </div>
                    <span className="badge bg-success">{activityStats.approvedSubmissions}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <FaTimesCircle className="text-danger me-2" />
                      Rejected
                    </div>
                    <span className="badge bg-danger">{activityStats.rejectedSubmissions}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-8">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body">
                  <h6 className="card-title mb-4">Recent Activities</h6>
                  <div className="activity-list">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="d-flex align-items-center mb-3">
                        <div className="activity-icon me-3">
                          {activity.type === 'submission' && <FaFileAlt className="text-primary" />}
                          {activity.type === 'registration' && <FaUserGraduate className="text-success" />}
                          {activity.type === 'approval' && <FaCheckCircle className="text-info" />}
                        </div>
                        <div className="activity-details">
                          <p className="mb-0">{activity.description}</p>
                          <small className="text-muted">{new Date(activity.timestamp).toLocaleString()}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* User Trends Chart */}
          <div className="row mt-4">
            <div className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <h6 className="card-title mb-4">User Growth Trends</h6>
                  <div style={{ height: '300px' }}>
                    <Line 
                      data={chartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminActivity;
