import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './resources/Sidebar';
import Header from './resources/Header';
import { getUserName, getToken } from './resources/Utils';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Dashboard.css';
import '../css/Dashboard2.css';

const InstructorRequest = () => {
  const navigate = useNavigate();
  const [userName] = useState(getUserName());
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('UNREAD');
  const [rejectMessage, setRejectMessage] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [userRole, setUserRole] = useState('');

  const fetchRequests = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) {
        navigate('/');
        return;
      }

      const response = await fetch('http://localhost:8000/instructor/team-requests', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch requests');
      
      const data = await response.json();
      setRequests(data);
    } catch (error) {
      console.error('Error:', error);
      alert('Error fetching requests');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleRequest = async (requestId, status) => {
    try {
      console.log('Starting request handling...', { requestId, status });
      setLoading(true);
      const token = getToken();
      console.log('Token retrieved:', token ? 'Valid token' : 'No token');

      // Close modal if rejecting
      if (status === 'REJECTED') {
        console.log('Closing reject modal...');
        const modal = document.getElementById('rejectModal');
        const backdrop = document.querySelector('.modal-backdrop');
        if (modal) modal.style.display = 'none';
        if (backdrop) backdrop.remove();
        document.body.classList.remove('modal-open');
      }

      console.log('Sending request to server...', {
        url: `http://localhost:8000/instructor/team-requests/${requestId}/handle`,
        method: 'PUT',
        status,
        hasMessage: !!rejectMessage
      });

      const response = await fetch(`http://localhost:8000/instructor/team-requests/${requestId}/handle`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status,
          message: status === 'REJECTED' ? rejectMessage : ''
        })
      });

      console.log('Server response received:', {
        status: response.status,
        ok: response.ok
      });

      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to process request');
      }

      console.log('Updating local state...');
      // Update local state
      setRequests(prev => {
        const updated = prev.map(req => 
          req._id === requestId ? { ...req, status } : req
        );
        console.log('New requests state:', updated);
        return updated;
      });

      // Reset states
      console.log('Resetting form states...');
      setRejectMessage('');
      setSelectedRequest(null);
      
      // Switch to new tab
      console.log('Switching to tab:', status);
      setActiveTab(status);
      
      alert(`Request ${status.toLowerCase()} successfully`);
    } catch (error) {
      console.error('Detailed error information:', {
        message: error.message,
        stack: error.stack,
        error
      });
      alert('Error processing request: ' + error.message);
    } finally {
      console.log('Request handling completed');
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter(request => 
    activeTab === 'ALL' ? true : request.status === activeTab
  );

  // Add this helper function to format team members
  const formatTeamMembers = (teamMembers) => {
    if (!teamMembers || !Array.isArray(teamMembers)) return 'No members';
    return teamMembers
      .map(member => `${member.name} (${member.studentId})`)
      .join(', ');
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="dashboard-container d-flex">
      <Sidebar />
      <div className="main-section col-10">
        <Header userName={userName} userRole={userRole} />
        <main className="p-4">
          <div className="mb-4">
            <h4>Team Formation Requests</h4>
          </div>

          <ul className="nav nav-tabs mb-4">
            {['UNREAD', 'APPROVED', 'REJECTED'].map(tab => (
              <li key={tab} className="nav-item">
                <button 
                  className={`nav-link ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                  <span className={`badge ms-2 ${
                    tab === 'UNREAD' ? 'bg-warning' :
                    tab === 'APPROVED' ? 'bg-success' : 'bg-danger'
                  }`}>
                    {requests.filter(r => r.status === tab).length}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <div className="card">
            <div className="card-body">
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Student Name</th>
                      <th>Student ID</th>
                      <th>Team Members</th>
                      <th>Date Requested</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center">No requests found</td>
                      </tr>
                    ) : (
                      filteredRequests.map(request => (
                        <tr key={request._id}>
                          <td>{request.relatedData.studentId?.name || 'Unknown'}</td>
                          <td>{request.relatedData.studentId?.studentId || 'Unknown'}</td>
                          <td>{formatTeamMembers(request.relatedData.teamMembers)}</td>
                          <td>{new Date(request.timestamp).toLocaleDateString()}</td>
                          <td>
                            <span className={`badge ${
                              request.status === 'UNREAD' ? 'bg-warning' :
                              request.status === 'APPROVED' ? 'bg-success' : 'bg-danger'
                            }`}>
                              {request.status}
                            </span>
                          </td>
                          <td>
                            {request.status === 'UNREAD' && (
                              <>
                                <button
                                  className="btn btn-success btn-sm me-2"
                                  onClick={() => handleRequest(request._id, 'APPROVED')}
                                  disabled={loading}
                                >
                                  Approve
                                </button>
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() => setSelectedRequest(request)}
                                  data-bs-toggle="modal"
                                  data-bs-target="#rejectModal"
                                  disabled={loading}
                                >
                                  Reject
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>

        {/* Reject Modal */}
        <div className="modal fade" id="rejectModal" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Reject Request</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Reason for rejection (optional):</label>
                  <textarea
                    className="form-control"
                    value={rejectMessage}
                    onChange={(e) => setRejectMessage(e.target.value)}
                    rows="3"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => selectedRequest && handleRequest(selectedRequest._id, 'REJECTED')}
                  disabled={loading}
                >
                  Reject Request
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorRequest;
