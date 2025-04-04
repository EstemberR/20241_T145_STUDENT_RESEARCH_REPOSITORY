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
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';
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
import LoadingWithNetworkCheck from '../common/LoadingWithNetworkCheck';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Dashboard.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AdminActivity = () => {
  const navigate = useNavigate();
  const [userName] = useState(getUserName());
  const [userCounts, setUserCounts] = useState({
    students: 0,
    instructors: 0,
    activeUsers: 0,
    totalUsers: 0,
    studentTrends: [],
    instructorTrends: []
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

  // Replace the constant chartData with useState
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [{
      label: 'Research Submissions',
      data: [],
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      tension: 0.1
    }]
  });

  // Update the chart data when userCounts changes
  useEffect(() => {
    setChartData(prevData => ({
      ...prevData,
      datasets: [
        {
          ...prevData.datasets[0],
          data: userCounts.studentTrends || []
        },
        {
          ...prevData.datasets[1],
          data: userCounts.instructorTrends || []
        }
      ]
    }));
  }, [userCounts.studentTrends, userCounts.instructorTrends]);

  // Add this new useEffect specifically for graph data
  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        const token = getToken();
        if (!token) {
          navigate('/');
          return;
        }

        const response = await fetch('http://localhost:8000/admin/submission-trends', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`Graph error: ${response.status}`);
        }

        const data = await response.json();
        console.log('Graph data:', data);

        if (data.success) {
          const graphData = {
            labels: data.data.map(item => item.month),
            datasets: [{
              label: 'Total Submissions',
              data: data.data.map(item => item.count),
              borderColor: 'rgb(75, 192, 192)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              tension: 0.1,
              fill: true
            }]
          };

          setChartData(graphData);
        }

      } catch (error) {
        console.error('Error fetching graph data:', error);
      }
    };

    fetchGraphData();
  }, [navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getToken();
        if (!token) {
          navigate('/');
          return;
        }

        try {
          // Fetch user counts
          const userCountsResponse = await fetch('http://localhost:8000/admin/user-counts', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (!userCountsResponse.ok) {
            throw new Error(`User counts error: ${userCountsResponse.status}`);
          }

          const userCountsData = await userCountsResponse.json();
          const totalUsers = userCountsData.students + userCountsData.instructors;
          
          setUserCounts({
            students: userCountsData.students || 0,
            instructors: userCountsData.instructors || 0,
            activeUsers: userCountsData.activeUsers || totalUsers,
            totalUsers: totalUsers,
            studentTrends: userCountsData.studentTrends || [],
            instructorTrends: userCountsData.instructorTrends || []
          });

        } catch (error) {
          console.error('Error fetching user counts:', error);
          setError('Failed to load user counts');
          return;
        }

        try {
          // Fetch research submissions data
          const submissionsResponse = await fetch('http://localhost:8000/admin/submission-trends', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (!submissionsResponse.ok) {
            throw new Error(`Submissions error: ${submissionsResponse.status}`);
          }

          const submissionsData = await submissionsResponse.json();
          setActivityStats({
            totalSubmissions: submissionsData.totalSubmissions,
            pendingSubmissions: submissionsData.pendingSubmissions,
            approvedSubmissions: submissionsData.approvedSubmissions,
            rejectedSubmissions: submissionsData.rejectedSubmissions
          });

        } catch (error) {
          console.error('Error fetching submissions:', error);
          setError('Failed to load submission data');
        }

        try {
          // Fetch recent activities
          const recentActivityResponse = await fetch('http://localhost:8000/admin/recent-activities', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (!recentActivityResponse.ok) {
            throw new Error(`Recent activities error: ${recentActivityResponse.status}`);
          }

          const recentActivityData = await recentActivityResponse.json();
          setRecentActivity(recentActivityData.activities || []);

        } catch (error) {
          console.error('Error fetching recent activities:', error);
          setError('Failed to load recent activities');
          return;
        }

      } catch (err) {
        console.error('Error:', err);
        setError(`Failed to load data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = getToken();
        if (!token) {
          navigate('/');
          return;
        }

        // Changed from /research-counts to /research-stats
        const statsResponse = await fetch('http://localhost:8000/admin/research-stats', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!statsResponse.ok) {
          throw new Error(`Stats error: ${statsResponse.status}`);
        }

        const statsData = await statsResponse.json();
        console.log('Stats data received:', statsData); // Debug log

        if (statsData.success) {
          setActivityStats({
            totalSubmissions: statsData.total,
            pendingSubmissions: statsData.pending,
            approvedSubmissions: statsData.accepted,
            rejectedSubmissions: statsData.rejected
          });
        }

      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  const [researchTrendData, setResearchTrendData] = useState(null);

  useEffect(() => {
    const fetchResearchTrends = async () => {
      try {
        const token = getToken();
        if (!token) {
          navigate('/');
          return;
        }

        const response = await fetch('http://localhost:8000/admin/research-status-trends', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`Research trends error: ${response.status}`);
        }

        const result = await response.json();
        if (result.success) {
          setResearchTrendData(result.data);
        }
      } catch (error) {
        console.error('Error fetching research trends:', error);
      }
    };

    fetchResearchTrends();
  }, [navigate]);

  const [userTrendData, setUserTrendData] = useState(null);

  useEffect(() => {
    const fetchUserTrends = async () => {
      try {
        const token = getToken();
        if (!token) {
          navigate('/');
          return;
        }

        console.log('Fetching user trends...'); // Debug log

        const response = await fetch('http://localhost:8000/admin/user-trends', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`User trends error: ${response.status}`);
        }

        const result = await response.json();
        console.log('Raw user trend data:', result); // Debug log

        if (result.success && result.data) {
          console.log('Setting trend data:', result.data); // Debug log
          setUserTrendData(result.data);
        }

      } catch (error) {
        console.error('Error fetching user trends:', error);
      }
    };

    fetchUserTrends();
  }, [navigate]);

  const [userDistribution, setUserDistribution] = useState(null);

  useEffect(() => {
    const fetchUserDistribution = async () => {
      try {
        const token = getToken();
        if (!token) {
          navigate('/');
          return;
        }

        const response = await fetch('http://localhost:8000/admin/user-distribution', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`User distribution error: ${response.status}`);
        }

        const result = await response.json();
        if (result.success) {
          setUserDistribution(result.data);
        }
      } catch (error) {
        console.error('Error fetching user distribution:', error);
      }
    };

    fetchUserDistribution();
  }, [navigate]);

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

          {/* Research Trends Chart */}
          <div className="row mt-4">
            <div className="col-md-6 col-lg-4">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <h6 className="card-title mb-4">User Distribution</h6>
                  <div style={{ height: '250px', display: 'flex', justifyContent: 'center' }}>
                    {!userDistribution && <p>Loading user distribution...</p>}
                    {userDistribution && (
                      <div style={{ width: '100%', maxWidth: '300px' }}>
                        <Pie
                          data={userDistribution}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                position: 'top',
                              },
                              tooltip: {
                                callbacks: {
                                  label: function(context) {
                                    const label = context.label || '';
                                    const value = context.raw || 0;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    return `${label}: ${value} (${percentage}%)`;
                                  }
                                }
                              }
                            }
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-8">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <h6 className="card-title mb-4">Research Submissions Over Time</h6>
                  <div style={{ height: '250px' }}>
                    {!researchTrendData && <p>Loading trends data...</p>}
                    {researchTrendData && (
                      <Line
                        data={researchTrendData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          scales: {
                            y: {
                              beginAtZero: true,
                              ticks: {
                                stepSize: 1,
                                precision: 0
                              }
                            }
                          },
                          plugins: {
                            legend: {
                              position: 'top',
                            }
                          }
                        }}
                      />
                    )}
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
