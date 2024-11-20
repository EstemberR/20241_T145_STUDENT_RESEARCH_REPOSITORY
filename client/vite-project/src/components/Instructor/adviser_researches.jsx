import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './resources/Sidebar';
import Header from './resources/Header';
import { getUserName, getToken } from './resources/Utils';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Dashboard.css';
import '../css/Dashboard2.css';
import '../css/admin_dashboard.css';

const ResearchCard = ({ research, onViewDetails }) => (
  <div className="col-md-6 col-lg-4 mb-4">
    <div className="card h-100">
      <div className="card-body">
        <h5 className="card-title">{research.title}</h5>
        <p className="card-text">
          <strong>Student:</strong> {research.student?.name}<br />
          <strong>Course:</strong> {research.student?.course}<br />
          <strong>Status:</strong> <span className={`badge bg-${
            research.status === 'Pending' ? 'warning' : 
            research.status === 'Accepted' ? 'success' : 
            research.status === 'Revision' ? 'info' : 'danger'
          }`}>
            {research.status}
          </span>
        </p>
        <div className="card-text mb-3">
          <small className="text-muted">
            Submitted: {new Date(research.uploadDate).toLocaleDateString()}
          </small>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => onViewDetails(research)}
          data-bs-toggle="modal" 
          data-bs-target="#researchModal"
        >
          View Details
        </button>
      </div>
    </div>
  </div>
);

const AdviserResearches = () => {
  const navigate = useNavigate();
  const [userName] = useState(getUserName());
  const [userRole, setUserRole] = useState([]);
  const [advisedResearches, setAdvisedResearches] = useState([]);
  const [selectedResearch, setSelectedResearch] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const token = getToken();
        if (!token) {
          alert('Please log in first.');
          localStorage.removeItem('userName');
          localStorage.removeItem('token');
          navigate('/');
          return;
        }

        const response = await fetch('http://localhost:8000/instructor/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (response.ok) {
          setUserRole(data.role);
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
    };

    const fetchAdvisedResearches = async () => {
      try {
        const token = getToken();
        const response = await fetch('http://localhost:8000/instructor/advised-researches', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (response.ok) {
          setAdvisedResearches(data);
        }
      } catch (error) {
        console.error('Error fetching advised researches:', error);
      }
    };

    fetchUserRole();
    fetchAdvisedResearches();
  }, [navigate]);

  const handleViewDetails = (research) => {
    setSelectedResearch(research);
    setFeedback(research.comments || '');
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`http://localhost:8000/instructor/research/${selectedResearch._id}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          comments: feedback
        })
      });

      if (response.ok) {
        // Refresh the researches list
        const updatedResearches = advisedResearches.map(research => 
          research._id === selectedResearch._id 
            ? { ...research, comments: feedback }
            : research
        );
        setAdvisedResearches(updatedResearches);

        // Close modal
        const modalElement = document.getElementById('researchModal');
        if (modalElement) {
          const bootstrapModal = bootstrap.Modal.getInstance(modalElement);
          if (bootstrapModal) {
            bootstrapModal.hide();
          }
        }

        alert('Feedback submitted successfully!');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewFile = (fileId) => {
    window.open(`https://drive.google.com/file/d/${fileId}/view`, '_blank');
  };

  return (
    <div className="dashboard-container d-flex">
      <Sidebar />
      <div className="main-section col-10 d-flex flex-column">
        <Header userName={userName} userRole={userRole} />
        <main className="main-content p-4">
          <h4 className="mb-4">MY ADVISED RESEARCHES</h4>
          
          <div className="row">
            {advisedResearches.length === 0 ? (
              <div className="col-12">
                <div className="alert alert-info">
                  No research projects found where you are the adviser.
                </div>
              </div>
            ) : (
              advisedResearches.map(research => (
                <ResearchCard 
                  key={research._id} 
                  research={research} 
                  onViewDetails={handleViewDetails}
                />
              ))
            )}
          </div>

          {/* Research Details Modal */}
          <div className="modal fade" id="researchModal" tabIndex="-1" aria-labelledby="researchModalLabel" aria-hidden="true">
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id="researchModalLabel">Research Details</h5>
                  <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div className="modal-body">
                  {selectedResearch && (
                    <div className="container">
                      <div className="row mb-3">
                        <div className="col-12">
                          <h4>{selectedResearch.title}</h4>
                          <span className={`badge bg-${
                            selectedResearch.status === 'Pending' ? 'warning' :
                            selectedResearch.status === 'Accepted' ? 'success' :
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
                          <p><strong>Course:</strong></p>
                          <p>{selectedResearch.student?.course}</p>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-6">
                          <p><strong>Keywords:</strong></p>
                          <p>{selectedResearch.keywords}</p>
                        </div>
                        <div className="col-md-6">
                          <p><strong>Submission Date:</strong></p>
                          <p>{new Date(selectedResearch.uploadDate).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })}</p>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-12">
                          <p><strong>Abstract:</strong></p>
                          <p className="text-justify">{selectedResearch.abstract}</p>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-12">
                          <p><strong>Student Information:</strong></p>
                          <div className="row">
                            <div className="col-md-6">
                              <p>
                                <strong>Name:</strong> {selectedResearch.student?.name || 'N/A'}<br />
                                <strong>Student ID:</strong> {selectedResearch.student?.studentId || selectedResearch.studentId || 'N/A'}<br />
                                <strong>Course:</strong> {selectedResearch.student?.course || selectedResearch.course || 'N/A'}
                              </p>  
                            </div>
                            <div className="col-md-6">
                              <p>
                                <strong>Email:</strong> {selectedResearch.student?.email || 'N/A'}<br />
                                <strong>Section:</strong> {selectedResearch.student?.section || 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-12">
                          <p><strong>File:</strong></p>
                          <div className="d-flex align-items-center">
                            <i className="fas fa-file-pdf text-danger me-2"></i>
                            <span className="me-2">{selectedResearch.fileName || 'research.pdf'}</span>
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

                      {selectedResearch.comments && (
                        <div className="row mb-3">
                          <div className="col-12">
                            <p><strong>Previous Comments:</strong></p>
                            <p>{selectedResearch.comments}</p>
                          </div>
                        </div>
                      )}

                      <div className="row mb-3">
                        <div className="col-12">
                          <p><strong>Provide Feedback:</strong></p>
                          <textarea 
                            className="form-control"
                            rows="4"
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="Enter your feedback here..."
                            required
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                  <button 
                    type="button" 
                    className="btn btn-success"
                    onClick={handleSubmitFeedback}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Submitting...' : 'Submit Feedback'}
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

export default AdviserResearches;
