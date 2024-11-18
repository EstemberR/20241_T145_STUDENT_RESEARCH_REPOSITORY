import React, { useEffect, useRef,useState } from 'react';
import { Chart } from 'chart.js/auto';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './resources/Sidebar';
import Header from './resources/Header';
import { getUserName, getToken } from './resources/Utils';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Dashboard.css';
import '../css/Dashboard2.css';
import '../css/admin_dashboard.css';

const AdminRequest = () => {
  const location = useLocation();
  const chartRef = useRef(null);
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({
    totalInstructors: 0,
    totalAdvisers: 0,
    pendingRequests: 0
  });
  const navigate = useNavigate();
  const [userName] = useState(getUserName());
  const [activeTab, setActiveTab] = useState('pending');
  const [alert, setAlert] = useState({
    show: false,
    message: '',
    type: ''
  });

  useEffect(() => {
    const token = getToken();
    if (!token) {
      alert('Please log in first.');
      localStorage.removeItem('userName');
      localStorage.removeItem('token');
      navigate('/');
      return;
    }

    fetchRequests();
  }, [navigate]);

  const fetchRequests = async () => {
    try {
      const response = await fetch('http://localhost:8000/admin/adviser-requests', {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch requests');
      
      const data = await response.json();
      setRequests(data.requests);
      setStats(data.stats);

      // Update chart if it exists
      updateChart(data.stats);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to fetch requests');
    }
  };

  const handleRequestAction = async (requestId, status) => {
    try {
      const response = await fetch(`http://localhost:8000/admin/adviser-requests/${requestId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ status })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update request');
      }

      // Show success message
      setAlert({
        show: true,
        message: `Request ${status} successfully`,
        type: 'success'
      });

      // Refresh the data
      await fetchRequests();
    } catch (error) {
      console.error('Error:', error);
      setAlert({
        show: true,
        message: error.message || 'Failed to update request',
        type: 'danger'
      });
    }
  };

  const updateChart = (stats) => {
    if (chartRef.current && chartRef.current.chart) {
      chartRef.current.chart.data.datasets[0].data = [
        stats.totalInstructors,
        stats.totalAdvisers,
        stats.pendingRequests
      ];
      chartRef.current.chart.update();
    }
  };

  useEffect(() => {
    let chartInstance;
    if (chartRef.current) {
      chartInstance = new Chart(chartRef.current, {
        type: 'pie',
        data: {
          labels: ['Instructors', 'Advisers', 'Pending'],
          datasets: [
            {
              data: [stats.totalInstructors, stats.totalAdvisers, stats.pendingRequests],
              backgroundColor: ['#4bc0c0', '#ff6384', '#36a2eb'],
            },
          ],
        },
        options: {
          plugins: {
            tooltip: { enabled: true },
            legend: { display: false },
          },
        },
      });
    }
    return () => {
      if (chartInstance) {
        chartInstance.destroy();
      }
    };
  }, [stats.totalInstructors, stats.totalAdvisers, stats.pendingRequests]);

  // Filter requests based on active tab
  const filteredRequests = requests.filter(request => request.status === activeTab);

  return (
    <div className="dashboard-container d-flex">
      <Sidebar />
      <div className="main-section col-10 d-flex flex-column">
        <Header userName={userName} />
        <main className="main-content">
          <h4 className="my-3">Role Requests Data</h4>
          <div className="row">
            <div className="col-md-12">
              <div className="card p-3 chartBox">
                <div className="row align-items-center chart-container">
                  {/* Pie Chart Section */}
                  <div className="col-4 d-flex justify-content-center">
                    <div className="position-relative chart-canvas-container">
                      <canvas ref={chartRef} className="chart-canvas"></canvas>
                    </div>
                  </div>
                  <div className="col-8">
                    <div className="row text-center">
                      <div className="col">
                        <div className="row chartText">
                          <h6>Total Instructors</h6>
                          <span className="teal">{stats.totalInstructors}</span>
                        </div>
                        <div className="row chartText">
                          <h6>Total Advisers</h6>
                          <span className="red">{stats.totalAdvisers}</span>
                        </div>
                      </div>
                      <div className="col">
                        <div className="row chartText">
                          <h6>Pending Requests</h6>
                          <span className="yellow">{stats.pendingRequests}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <ul className="nav nav-tabs">
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'pending' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pending')}
                  >
                    Pending
                    <span className="badge bg-warning ms-2">
                      {requests.filter(r => r.status === 'pending').length}
                    </span>
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'approved' ? 'active' : ''}`}
                    onClick={() => setActiveTab('approved')}
                  >
                    Approved
                    <span className="badge bg-success ms-2">
                      {requests.filter(r => r.status === 'approved').length}
                    </span>
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'rejected' ? 'active' : ''}`}
                    onClick={() => setActiveTab('rejected')}
                  >
                    Rejected
                    <span className="badge bg-danger ms-2">
                      {requests.filter(r => r.status === 'rejected').length}
                    </span>
                  </button>
                </li>
              </ul>

              <table className="table table-striped table-bordered mt-3">
                <thead className="table-primary">
                  <tr>
                    <th>Research Title</th>
                    <th>Instructor Name</th>
                    <th>Email</th>
                    <th>Message</th>
                    <th>Date Requested</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((request) => (
                    <tr key={request._id}>
                      <td>{request.researchTitle}</td>
                      <td>{request.instructorName}</td>
                      <td>{request.instructorEmail}</td>
                      <td>{request.message}</td>
                      <td>{new Date(request.createdAt).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge ${
                          request.status === 'pending' ? 'bg-warning' :
                          request.status === 'approved' ? 'bg-success' :
                          'bg-danger'
                        }`}>
                          {request.status}
                        </span>
                      </td>
                      <td>
                        {request.status === 'pending' && (
                          <>
                            <button 
                              className="btn btn-success btn-sm me-2"
                              onClick={() => handleRequestAction(request._id, 'approved')}
                            >
                              <i className="fas fa-check"></i> Accept
                            </button>
                            <button 
                              className="btn btn-danger btn-sm"
                              onClick={() => handleRequestAction(request._id, 'rejected')}
                            >
                              <i className="fas fa-times"></i> Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminRequest;
