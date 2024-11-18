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
  const [userRole, setUserRole] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [selectedResearch, setSelectedResearch] = useState(null);
  const [activeTab, setActiveTab] = useState('Pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserAndSubmissions = async () => {
      try {
        setLoading(true);
        const token = getToken();
        if (!token) {
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

        // Fetch submissions
        const submissionsResponse = await fetch('http://localhost:8000/instructor/submissions', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!submissionsResponse.ok) {
          throw new Error(`HTTP error! status: ${submissionsResponse.status}`);
        }
        const submissionsData = await submissionsResponse.json();
        setSubmissions(submissionsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch data');
        setLoading(false);
      }
    };

    fetchUserAndSubmissions();
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
      <Header userName={userName} userRole={userRole} />

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
                      <td className="centering">{submission.studentId}</td>
                      <td className="centering">{submission.title}</td>
                      <td className="centering">{submission.studentName}</td>
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
                <div className="container">
                  <div className="row mb-3">
                    <div className="col-12">
                      <h4>{selectedResearch.title}</h4>
                      <span className={`badge bg-${
                        selectedResearch.status === 'Accepted' ? 'success' :
                        selectedResearch.status === 'Pending' ? 'warning' :
                        selectedResearch.status === 'Revision' ? 'info' : 'danger'
                      } mb-2`}>
                        {selectedResearch.status}
                      </span>
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <p><strong>Authors:</strong></p>
                      <p>{selectedResearch.authors}</p>
                    </div>
                    <div className="col-md-6">
                      <p><strong>Keywords:</strong></p>
                      <p>{selectedResearch.keywords}</p>
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-12">
                      <p><strong>Abstract:</strong></p>
                      <p className="text-justify">{selectedResearch.abstract}</p>
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <p><strong>Submission Date:</strong></p>
                      <p>{new Date(selectedResearch.uploadDate).toLocaleDateString('en-US', {
                        month: '2-digit',
                        day: '2-digit',
                        year: 'numeric'
                      })}</p>
                    </div>
                    <div className="col-md-6">
                      <p><strong>File:</strong></p>
                      <div className="d-flex align-items-center">
                        <i className="fas fa-file-pdf text-danger me-2"></i>
                        <span className="me-2">research.pdf</span>
                        <a 
                          href={`https://drive.google.com/file/d/${selectedResearch.driveFileId}/view`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-primary"
                        >
                          <i className="fas fa-external-link-alt me-1"></i>
                          Open File
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <p><strong>Student:</strong> {selectedResearch.studentName}</p>
                      <p><strong>Student ID:</strong> {selectedResearch.studentId}</p>
                    </div>
                    <div className="col-md-6">
                      <p><strong>Section:</strong> {selectedResearch.section}</p>
                      <p><strong>Email:</strong> {selectedResearch.studentEmail}</p>
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