import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './resources/Sidebar';
import Header from './resources/Header';
import { getUserName, getToken } from './resources/Utils';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Dashboard.css';
import '../css/Dashboard2.css';
import '../css/admin_dashboard.css';

const InstructorSubmissions = () => {
  const navigate = useNavigate();
  const [userName] = useState(getUserName());
  const [submissions, setSubmissions] = useState([]);
  const [selectedResearch, setSelectedResearch] = useState(null);
  const [activeTab, setActiveTab] = useState('Pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        const token = getToken();
        console.log('Fetching with token:', token); 
        const response = await fetch('http://localhost:8000/instructor/submissions', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('Response status:', response.status);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Received data:', data); 
        
        setSubmissions(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching submissions:', error);
        setError('Failed to fetch submissions');
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, [navigate]);
  const handleStatusUpdate = async (submissionId, newStatus, note = '') => {
    try {
      const token = getToken();
      const response = await fetch(`http://localhost:8000/instructor/submissions/${submissionId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: newStatus,
          note: note
        })
      });
      if (!response.ok) {
        throw new Error('Failed to update status');
      }
      setSubmissions(submissions.map(sub => 
        sub._id === submissionId ? { ...sub, status: newStatus } : sub
      ));
      alert(`Research ${newStatus.toLowerCase()} successfully`);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };
  const filteredData = submissions.filter((submission) => submission.status === activeTab);
  const handleViewClick = (research) => {
    setSelectedResearch(research);
    const viewModal = new window.bootstrap.Modal(document.getElementById('viewResearchModal'));
    viewModal.show();
  };

  return (
    <div className="dashboard-container d-flex">
      <Sidebar />
      <div className="main-section col-10 d-flex flex-column">
        <Header userName={userName} />

        <main className="main-content">
            <h4 className="my-3">STUDENT SUBMISSIONS</h4>
            <ul className="nav nav-tabs">
              <li className="nav-item pending">
                <button
                  className={`nav-link ${activeTab === 'Pending' ? 'active' : ''} x`}
                  onClick={() => setActiveTab('Pending')}
                >
                  Pending
                  <span className="badge bg-warning ms-2">
                    {submissions.filter(submission => submission.status === 'Pending').length}
                  </span>
                </button>
              </li>
              <li className="nav-item accepted">
                <button
                  className={`nav-link ${activeTab === 'Accepted' ? 'active' : ''} x`}
                  onClick={() => setActiveTab('Accepted')}
                >
                  Accepted
                  <span className="badge bg-success ms-2">
                    {submissions.filter(submission => submission.status === 'Accepted').length}
                  </span>
                </button>
              </li>
              <li className="nav-item revision">
                <button
                  className={`nav-link ${activeTab === 'Revision' ? 'active' : ''} x`}
                  onClick={() => setActiveTab('Revision')}
                >
                  Revision
                  <span className="badge bg-info ms-2">
                    {submissions.filter(submission => submission.status === 'Revision').length}
                  </span>
                </button>
              </li>
              <li className="nav-item rejected">
                <button
                  className={`nav-link ${activeTab === 'Rejected' ? 'active' : ''} x`}
                  onClick={() => setActiveTab('Rejected')}
                >
                  Rejected
                  <span className="badge bg-danger ms-2">
                    {submissions.filter(submission => submission.status === 'Rejected').length}
                  </span>
                </button>
              </li>
            </ul>
            {loading ? (
              <div>Loading submissions...</div>
            ) : error ? (
              <div className="alert alert-danger">{error}</div>
            ) : (
              <table className="table table-green-theme table-striped table-bordered mt-3">
                <thead className="table-primary">
                  <tr>
                    <th className="centering">ID</th>
                    <th className="centering">Title</th>
                    <th className="centering">Student</th>
                    <th className="centering">Date Submitted</th>
                    <th className="centering">Status</th>
                    <th className="centering">View</th>
                    <th className="centering">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((submission) => (
                    <tr key={submission._id}>
                      <td className="centering">{submission._id}</td>
                      <td className="centering">{submission.title}</td>
                      <td className="centering">{submission.authors}</td>
                      <td className="centering">
                        {new Date(submission.uploadDate).toLocaleDateString()}
                      </td>
                      <td className="centering">
                        <span className={`badge bg-${
                          submission.status === 'Accepted' ? 'success' :
                          submission.status === 'Pending' ? 'warning' :
                          submission.status === 'Revision' ? 'info' :
                          'danger'
                        }`}>
                          {submission.status}
                        </span>
                      </td>
                      <td className="centering">
                        <button
                          className="btn btn-info btn-sm"
                          onClick={() => handleViewClick(submission)}>
                          <i className="fas fa-eye"></i> View
                        </button>
                      </td>
                      <td className="centering">
                        {submission.status === 'Pending' && (
                          <>
                            <button 
                              className="btn btn-success btn-sm ms-2"
                              onClick={() => handleStatusUpdate(submission._id, 'Accepted')}
                            >
                              <i className="fas fa-check"></i> Accept
                            </button>
                            <button 
                              className="btn btn-warning btn-sm ms-2"
                              onClick={() => handleStatusUpdate(submission._id, 'Revision')}
                            >
                              <i className="fas fa-edit"></i> Revise
                            </button>
                            <button 
                              className="btn btn-danger btn-sm ms-2"
                              onClick={() => handleStatusUpdate(submission._id, 'Rejected')}
                            >
                              <i className="fas fa-times"></i> Reject
                            </button>
                          </>
                        )}
                        {submission.status === 'Revision' && (
                          <button 
                            className="btn btn-success btn-sm ms-2"
                            onClick={() => handleStatusUpdate(submission._id, 'Accepted')}
                          >
                            <i className="fas fa-check"></i> Accept Revision
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
        </main>
      </div>
      <div className="modal fade" id="viewResearchModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Research Details</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              {selectedResearch && (
                <div className="research-details">
                  <div className="row mb-3">
                    <div className="col-4 fw-bold">Title:</div>
                    <div className="col-8">{selectedResearch.title}</div>
                  </div>
                  
                  <div className="row mb-3">
                    <div className="col-4 fw-bold">Authors:</div>
                    <div className="col-8">{selectedResearch.authors}</div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-4 fw-bold">Abstract:</div>
                    <div className="col-8">{selectedResearch.abstract}</div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-4 fw-bold">Keywords:</div>
                    <div className="col-8">{selectedResearch.keywords}</div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-4 fw-bold">Status:</div>
                    <div className="col-8">
                      <span className={`badge bg-${
                        selectedResearch.status === 'Accepted' ? 'success' :
                        selectedResearch.status === 'Pending' ? 'warning' :
                        selectedResearch.status === 'Rejected' ? 'danger' : 'info'
                      }`}>
                        {selectedResearch.status}
                      </span>
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-4 fw-bold">Submission Date:</div>
                    <div className="col-8">
                      {new Date(selectedResearch.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-4 fw-bold">Research File:</div>
                    <div className="col-8">
                      <a 
                        href={selectedResearch.fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-primary"
                      >
                        <i className="fas fa-file-pdf me-2"></i>
                        View Document
                      </a>
                    </div>
                  </div>
                  {selectedResearch.status === 'Pending' && (
                    <div className="mt-4 border-top pt-3">
                      <h6 className="mb-3">Update Status</h6>
                      <div className="d-flex gap-2">
                        <button 
                          className="btn btn-success"
                          onClick={() => handleStatusUpdate(selectedResearch._id, 'Accepted')}
                        >
                          <i className="fas fa-check me-2"></i>Accept
                        </button>
                        <button 
                          className="btn btn-warning"
                          onClick={() => handleStatusUpdate(selectedResearch._id, 'Revision')}
                        >
                          <i className="fas fa-edit me-2"></i>Request Revision
                        </button>
                        <button 
                          className="btn btn-danger"
                          onClick={() => handleStatusUpdate(selectedResearch._id, 'Rejected')}
                        >
                          <i className="fas fa-times me-2"></i>Reject
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorSubmissions;