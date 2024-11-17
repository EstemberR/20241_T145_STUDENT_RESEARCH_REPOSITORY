import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './resources/Sidebar';
import Header from './resources/Header';
import { getUserName, getToken } from './resources/Utils';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Dashboard.css';
import '../css/Dashboard2.css';
import '../css/admin_dashboard.css';

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'pending': return 'bg-warning';
    case 'approved': return 'bg-success';
    case 'rejected': return 'bg-danger';
    default: return 'bg-secondary';
  }
};

// Table component for requests
const RequestTable = ({ requests }) => (
  <div className="table-responsive">
    <table className="table table-hover">
      <thead>
        <tr>
          <th>Research Title</th>
          <th>Message</th>
          <th>Date Requested</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {requests.length === 0 ? (
          <tr>
            <td colSpan="4" className="text-center">No requests found</td>
          </tr>
        ) : (
          requests.map((request) => (
            <tr key={request._id}>
              <td>{request.researchTitle}</td>
              <td>{request.message}</td>
              <td>{new Date(request.createdAt).toLocaleDateString()}</td>
              <td>
                <span className={`badge ${getStatusBadgeClass(request.status)}`}>
                  {request.status}
                </span>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

const InstructorRequest = () => {
  const navigate = useNavigate();
  const [userName] = useState(getUserName());
  const [researchList, setResearchList] = useState([]);
  const [requests, setRequests] = useState([]);
  const [selectedResearch, setSelectedResearch] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isLoadingResearch, setIsLoadingResearch] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    const token = getToken();
    if (!token) {
      localStorage.removeItem('userName');
      localStorage.removeItem('token');
      alert('Please log in first.');
      navigate('/');
      return;
    }

    fetchData(token);
  }, [navigate]);

  const fetchData = async (token) => {
    try {
      const [researchResponse, requestsResponse] = await Promise.all([
        fetch('http://localhost:8000/instructor/available-research', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:8000/instructor/adviser-requests', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (!researchResponse.ok || !requestsResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const [researchData, requestsData] = await Promise.all([
        researchResponse.json(),
        requestsResponse.json()
      ]);

      setResearchList(researchData);
      setRequests(requestsData);
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to load data');
    } finally {
      setIsLoadingResearch(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedResearch) {
      setError("Please select a research project");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const selectedResearchTitle = researchList.find(r => r._id === selectedResearch)?.title;

      const response = await fetch('http://localhost:8000/instructor/adviser-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          researchId: selectedResearch,
          message: message
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Request failed');
      }

      // Refresh the requests list
      const token = getToken();
      await fetchData(token);

      // Reset form
      setSelectedResearch("");
      setMessage("");
      
      // Close modal
      const modalElement = document.getElementById('requestModal');
      if (modalElement) {
        const bootstrapModal = bootstrap.Modal.getInstance(modalElement);
        if (bootstrapModal) {
          bootstrapModal.hide();
        }
      }

      alert('Request submitted successfully!');
    } catch (err) {
      setError(err.message || "Failed to submit request");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRequests = requests.filter(request => request.status === activeTab);

  return (
    <div className="dashboard-container d-flex">
      <Sidebar />
      <div className="main-section col-10 d-flex flex-column">
        <Header userName={userName} />
        
        <main className="main-content p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4>ADVISER REQUESTS</h4>
            <button 
              className="btn btn-success" 
              data-bs-toggle="modal" 
              data-bs-target="#requestModal"
            >
              <i className="fas fa-plus me-2"></i>New Request
            </button>
          </div>

          <ul className="nav nav-tabs mb-4">
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

          <div className="card">
            <div className="card-body">
              <RequestTable requests={filteredRequests} />
            </div>
          </div>

          <div className="modal fade" id="requestModal" tabIndex="-1" aria-hidden="true">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">New Adviser Request</h5>
                  <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div className="modal-body">
                  <form id="requestForm" onSubmit={handleSubmit}>
                    {error && <div className="alert alert-danger mb-3">{error}</div>}
                    <div className="mb-3">
                      <label htmlFor="researchSelect" className="form-label">Select Research to Apply As Adviser</label>
                      <select 
                        id="researchSelect" 
                        className="form-select" 
                        value={selectedResearch} 
                        onChange={(e) => setSelectedResearch(e.target.value)}
                        disabled={isLoadingResearch}
                      >
                        <option value="">
                          {isLoadingResearch ? "Loading research projects..." : "Choose a research project..."}
                        </option>
                        {researchList.map((research) => (
                          <option key={research._id} value={research._id}>
                            {research.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="adviserMessage" className="form-label">Message to Admin (Optional)</label>
                      <textarea
                        id="adviserMessage"
                        className="form-control"
                        rows="3"
                        placeholder="Explain why you wish to be the adviser..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                      ></textarea>
                    </div>
                  </form>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                  <button 
                    type="submit" 
                    form="requestForm"
                    className="btn btn-success"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Submitting...
                      </>
                    ) : (
                      'Submit Request'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default InstructorRequest;
