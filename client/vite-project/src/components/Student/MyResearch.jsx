import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './resources/Sidebar';
import Header from './resources/Header';
import { Link } from 'react-router-dom';
import { getUserName, getToken } from './resources/Utils';
import LoadingWithNetworkCheck from '../common/LoadingWithNetworkCheck';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Dashboard.css';

const RESEARCH_STATUS = {
  PENDING: 'Pending',
  APPROVED: 'Accepted',
  REVISE: 'Revision',
  REJECTED: 'Rejected'
};

const MyResearch = () => {
  const navigate = useNavigate();
  const [userName] = useState(getUserName());
  const [file, setFile] = useState(null);
  const [studentInfo, setStudentInfo] = useState(null);
  const [researchEntries, setResearchEntries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    abstract: '',
    authors: '',
    keywords: '',
    driveLink: '',
    status: RESEARCH_STATUS.PENDING,
    uploadDate: new Date().toISOString().split('T')[0]
  });

  const [activeTab, setActiveTab] = useState(RESEARCH_STATUS.PENDING);
  const [selectedResearch, setSelectedResearch] = useState(null);
  const [availableAuthors, setAvailableAuthors] = useState([]);
  const [selectedAuthors, setSelectedAuthors] = useState([]);
  const [authorSearchTerm, setAuthorSearchTerm] = useState('');
  const [teamInfo, setTeamInfo] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [researchToDelete, setResearchToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasTeam, setHasTeam] = useState(false);
  const [fileVersion, setFileVersion] = useState(1);
  const [versionHistory, setVersionHistory] = useState([]);
  const [isResubmitting, setIsResubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchResearchEntries = async () => {
    try {
      const token = getToken();
      if (!token) {
        showAlertMessage('Please log in first.', 'danger');
        localStorage.removeItem('userName');
        localStorage.removeItem('token');
        navigate('/');
        return;
      }

      const response = await fetch('http://localhost:8000/student/research', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch research entries: ${response.status}`);
      }

      const data = await response.json();
      setResearchEntries(data);
    } catch (error) {
      console.error('Error fetching research entries:', error);
      showAlertMessage(`Error fetching research entries: ${error.message}`, 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = getToken();
    if (!token) {
      alert('Please log in first.');
      localStorage.removeItem('userName');
      localStorage.removeItem('token');
      navigate('/');
    } else {
      fetchResearchEntries();
    }
  }, [navigate]);

  useEffect(() => {
    const fetchStudentInfo = async () => {
      try {
        const token = getToken();
        const response = await fetch('http://localhost:8000/student/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch student info');
        
        const data = await response.json();
        console.log('Student info loaded:', data);
        setStudentInfo(data);
      } catch (error) {
        console.error('Error fetching student info:', error);
      }
    };

    fetchStudentInfo();
  }, []);

  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const token = getToken();
        const response = await fetch('http://localhost:8000/student/all-students', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch students');
        
        const data = await response.json();
        setAvailableAuthors(data);
      } catch (error) {
        console.error('Error fetching authors:', error);
      }
    };

    fetchAuthors();
  }, []);

  useEffect(() => {
    const fetchTeamInfo = async () => {
      try {
        const token = getToken();
        const response = await fetch('http://localhost:8000/student/check-team-status', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch team info');
        
        const data = await response.json();
        if (data.hasApprovedTeam) {
          setTeamInfo(data);
          const authorsList = data.teamMembers
            .map(member => member.replace(' (Team Leader)', ''))
            .join(', ');
          setFormData(prev => ({
            ...prev,
            authors: authorsList
          }));
        }
      } catch (error) {
        console.error('Error fetching team info:', error);
      }
    };

    fetchTeamInfo();
  }, []);

  useEffect(() => {
    const checkTeamStatus = async () => {
      try {
        setLoading(true);
        const token = getToken();
        const response = await fetch('http://localhost:8000/student/check-team-status', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        setHasTeam(data.hasApprovedTeam);

        if (!data.hasApprovedTeam) {
          showAlertMessage(
            'You need to have an approved team before submitting research. Please go to Manage Members section first.',
            'warning'
          );
          setShowForm(false);
        }
      } catch (error) {
        console.error('Error checking team status:', error);
        showAlertMessage('Error checking team status', 'danger');
      } finally {
        setLoading(false);
      }
    };

    checkTeamStatus();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      showAlertMessage(`File selected: ${e.target.files[0].name}`, 'info');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleAddNewClick = (e) => {
    e.preventDefault();
    
    if (!studentInfo || !studentInfo.course) {
      showAlertMessage('Please set your course in your profile before submitting research.', 'warning');
      return;
    }

    // If student has a course, then show the modal
    const modal = document.getElementById('submitResearchModal');
    if (modal) {
      const bootstrapModal = new bootstrap.Modal(modal);
      bootstrapModal.show();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      showAlertMessage('Please select a file to upload.', 'warning');
      return;
    }

    if (!studentInfo) {
      showAlertMessage('Student information not loaded yet. Please try again.', 'warning');
      return;
    }

    if (!studentInfo.course) {
      showAlertMessage('Please set your course in your profile before submitting research.', 'warning');
      navigate('/profile');
      return;
    }

    setPendingAction({
      type: 'submit',
      data: { formData, file }
    });
    setShowConfirmModal(true);
  };

  const handleConfirmedAction = async () => {
    if (!pendingAction || isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (pendingAction.type === 'delete') {
        const token = getToken();
        const response = await fetch(`http://localhost:8000/student/research/${pendingAction.data._id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          // Close the confirmation modal
          setShowConfirmModal(false);
          setPendingAction(null);
          setResearchToDelete(null);
          
          showAlertMessage('Research deleted successfully', 'success');
          await fetchResearchEntries(); // Refresh the list
        } else {
          const data = await response.json();
          showAlertMessage(data.message || 'Error deleting research', 'danger');
        }
      } else {
        // Create form data with course included
        const formDataToSubmit = new FormData();
        formDataToSubmit.append('file', file);
        formDataToSubmit.append('title', formData.title);
        formDataToSubmit.append('abstract', formData.abstract);
        formDataToSubmit.append('authors', selectedAuthors.map(author => author.name).join(', '));
        formDataToSubmit.append('keywords', formData.keywords);
        formDataToSubmit.append('course', studentInfo.course);
        formDataToSubmit.append('status', 'Pending');
        formDataToSubmit.append('uploadDate', new Date().toISOString());
        formDataToSubmit.append('fileName', file.name);

       
        const fileUploadResponse = await fetch('http://localhost:8000/api/auth/google-drive', {
          method: 'POST',
          body: formDataToSubmit,
        });

        if (!fileUploadResponse.ok) {
          throw new Error('File upload failed');
        }

        const fileResult = await fileUploadResponse.json();
        
        // Then submit research data
        const token = getToken();
        const researchSubmitResponse = await fetch('http://localhost:8000/student/submit-research', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            title: formData.title,
            abstract: formData.abstract,
            authors: selectedAuthors.map(author => author.name).join(', '),
            keywords: formData.keywords,
            fileUrl: `https://drive.google.com/file/d/${fileResult.fileId}/view`,
            driveFileId: fileResult.fileId,
            fileName: file.name,
            uploadDate: new Date().toISOString()
          })
        });

        if (!researchSubmitResponse.ok) {
          throw new Error('Failed to submit research');
        }

        const savedResearch = await researchSubmitResponse.json();
        console.log('Research saved:', savedResearch);

        // After successful submission, close all modals
        const submitModal = bootstrap.Modal.getInstance(document.getElementById('submitResearchModal'));
        const fileModal = bootstrap.Modal.getInstance(document.getElementById('fileUploadModal'));
        const confirmModal = bootstrap.Modal.getInstance(document.getElementById('confirmModal'));
        
        if (submitModal) submitModal.hide();
        if (fileModal) fileModal.hide();
        if (confirmModal) confirmModal.hide();

        // Reset form and states
        setFormData({
          title: '',
          abstract: '',
          authors: '',
          keywords: '',
          driveLink: '',
          status: RESEARCH_STATUS.PENDING,
          uploadDate: new Date().toISOString().split('T')[0]
        });
        setFile(null);
        setShowForm(false);
        setShowConfirmModal(false);
        setPendingAction(null);

        // Show success message and refresh data
        showAlertMessage('Research submitted successfully!', 'success');
        await fetchResearchEntries();
      }
    } catch (error) {
      console.error('Error:', error);
      showAlertMessage(error.message || 'An error occurred', 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewResearch = (research) => {
    setSelectedResearch(research);
  };

  const handleDelete = (research) => {
    setResearchToDelete(research);
    setPendingAction({
      type: 'delete',
      data: research
    });
    setShowConfirmModal(true);
  };

  const showAlertMessage = (message, type) => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 5000);
  };

  const handleResubmitClick = (research) => {
    setSelectedResearch(research);
    setFormData({
      ...research,
      file: null
    });
    setFileVersion(research.version || 1);
  };

  const handleResubmit = async (e) => {
    e.preventDefault();
    if (!file || isResubmitting) return;

    setIsResubmitting(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', file.name);

      // Upload file to Google Drive
      const fileUploadResponse = await fetch('http://localhost:8000/api/auth/google-drive', {
        method: 'POST',
        body: formData,
      });

      if (!fileUploadResponse.ok) {
        throw new Error('File upload failed');
      }

      const fileResult = await fileUploadResponse.json();
      const token = getToken();

      // Resubmit research with new file
      const response = await fetch('http://localhost:8000/student/resubmit-research', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          researchId: selectedResearch._id,
          title: formData.title,
          abstract: formData.abstract,
          authors: selectedAuthors.map(author => author.name).join(', '),
          keywords: formData.keywords,
          fileUrl: `https://drive.google.com/file/d/${fileResult.fileId}/view`,
          driveFileId: fileResult.fileId,
          fileName: file.name,
          version: (selectedResearch.version || 1) + 1,
          uploadDate: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to resubmit research');
      }

      showAlertMessage('Research resubmitted successfully', 'success');
      fetchResearchEntries(); // Refresh the list
      
      const modal = bootstrap.Modal.getInstance(document.getElementById('resubmitModal'));
      modal.hide();
      
      // Reset file input
      setFile(null);
    } catch (error) {
      console.error('Error resubmitting research:', error);
      showAlertMessage('Error resubmitting research', 'danger');
    } finally {
      setIsResubmitting(false); // Re-enable the button
    }
  };

  const fetchVersionHistory = async (researchId) => {
    try {
      const token = getToken();
      const response = await fetch(`http://localhost:8000/student/research/${researchId}/versions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch version history');
      }

      const data = await response.json();
      setVersionHistory(data);
    } catch (error) {
      console.error('Error fetching version history:', error);
      showAlertMessage('Failed to fetch version history', 'danger');
    }
  };

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
      <div className="main-section col-10">
        <Header userName={userName} />
        <main className="p-4">
          {loading ? (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
              <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : !hasTeam ? (
            <div className="card shadow-sm">
              <div className="card-header bg-warning text-dark">
                <h4 className="mb-0">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  Team Required
                </h4>
              </div>
              <div className="card-body">
                <div className="alert alert-warning">
                  <h5 className="alert-heading">
                    <i className="fas fa-users me-2"></i>
                    No Approved Team Found
                  </h5>
                  <hr />
                  <p>
                    You need to have an approved team before you can submit research papers.
                    Please set up your team first.
                  </p>
                  <a href="/student/project-members" className="btn btn-primary mt-2">
                    <i className="fas fa-user-plus me-2"></i>
                    Go to Manage Members
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div>
              {/* Research Table Section */}
              <h4 className="my-3">STUDENT SUBMISSIONS</h4>
              <div className="d-flex justify-content-end mb-3" style={{marginRight: '60px'}}>
                <button 
                  className="btn btn-success" 
                  onClick={handleAddNewClick}
                >
                  <i className="fas fa-plus me-2"></i>Add New Research
                </button>
              </div>
              <div>
                {/* Tab Navigation */}
                <ul className="nav nav-tabs mb-4">
                  <li className="nav-item">
                    <button 
                      className={`nav-link ${activeTab === RESEARCH_STATUS.PENDING ? 'active' : ''}`}
                      onClick={() => setActiveTab(RESEARCH_STATUS.PENDING)}
                    >
                      Pending
                      <span className="badge bg-warning ms-2">
                        {researchEntries.filter(r => r.status === RESEARCH_STATUS.PENDING).length}
                      </span>
                    </button>
                  </li>
                  <li className="nav-item">
                    <button 
                      className={`nav-link ${activeTab === RESEARCH_STATUS.APPROVED ? 'active' : ''}`}
                      onClick={() => setActiveTab(RESEARCH_STATUS.APPROVED)}
                    >
                      Accepted
                      <span className="badge bg-success ms-2">
                        {researchEntries.filter(r => r.status === RESEARCH_STATUS.APPROVED).length}
                      </span>
                    </button>
                  </li>
                  <li className="nav-item">
                    <button 
                      className={`nav-link ${activeTab === RESEARCH_STATUS.REVISE ? 'active' : ''}`}
                      onClick={() => setActiveTab(RESEARCH_STATUS.REVISE)}
                    >
                      Revision
                      <span className="badge bg-info ms-2">
                        {researchEntries.filter(r => r.status === RESEARCH_STATUS.REVISE).length}
                      </span>
                    </button>
                  </li>
                  <li className="nav-item">
                    <button 
                      className={`nav-link ${activeTab === RESEARCH_STATUS.REJECTED ? 'active' : ''}`}
                      onClick={() => setActiveTab(RESEARCH_STATUS.REJECTED)}
                    >
                      Rejected
                      <span className="badge bg-secondary ms-2">
                        {researchEntries.filter(r => r.status === RESEARCH_STATUS.REJECTED).length}
                      </span>
                    </button>
                  </li>
                </ul>

                {/* Tables for each status */}
                <div className="tab-content">
                  {Object.values(RESEARCH_STATUS).map((status) => (
                    <div 
                      key={status}
                      className={`tab-pane fade ${activeTab === status ? 'show active' : ''}`}
                    >
                      <div className="card">
                        <div className="card-body">
                          <div className="table-responsive">
                            <table className="table table-hover">
                              <thead>
                                <tr>
                                  <th style={{ width: '20%' }}>Title</th>
                                  <th style={{ width: '5%' }}>Version</th>
                                  <th style={{ width: '20%' }}>Authors</th>
                                  <th style={{ width: '10%' }}>Keywords</th>
                                  <th style={{ width: '15%' }}>File</th>
                                  <th style={{ width: '8%' }}>Status</th>
                                  <th style={{ width: '10%' }}>Submission Date</th>
                                  <th style={{ width: '12%' }}>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {researchEntries.filter(research => research.status === status).map((research, index) => (
                                  <tr key={index}>
                                    <td style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      {research.title}
                                    </td>
                                    <td>v{research.version || 1}</td>
                                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      {research.authors}
                                    </td>
                                    <td style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      {research.keywords}
                                    </td>
                                    <td>
                                      <div className="d-flex align-items-center">
                                        <i className="fas fa-file-pdf text-danger me-2"></i>
                                        <span className="text-truncate me-2" style={{ maxWidth: '100px' }}>
                                          {research.fileName}
                                        </span>
                                        <a 
                                          href={`https://drive.google.com/file/d/${research.driveFileId}/view`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="btn btn-sm btn-link p-0"
                                          title="Open in Google Drive"
                                        >
                                          <i className="fas fa-external-link-alt"></i>
                                        </a>
                                      </div>
                                    </td>
                                    <td>
                                      <span className={`badge bg-${
                                        research.status === RESEARCH_STATUS.APPROVED ? 'success' :
                                        research.status === RESEARCH_STATUS.PENDING ? 'warning' :
                                        research.status === RESEARCH_STATUS.REVISE ? 'info' : 'danger'
                                      }`}>
                                        {research.status}
                                      </span>
                                    </td>
                                    <td>
                                      {new Date(research.uploadDate).toLocaleDateString()}
                                    </td>
                                    <td>
                                      <div className="d-flex gap-1 flex-nowrap">
                                        <button 
                                          className="btn btn-sm btn-primary"
                                          onClick={() => handleViewResearch(research)}
                                          data-bs-toggle="modal"
                                          data-bs-target="#viewResearchModal"
                                          title="View Details"
                                        >
                                          <i className="fas fa-eye text-white"></i>
                                        </button>
                                        <button 
                                          className="btn btn-sm btn-info"
                                          onClick={async () => {
                                            setSelectedResearch(research);
                                            await fetchVersionHistory(research._id);
                                            const modal = new bootstrap.Modal(document.getElementById('versionHistoryModal'));
                                            modal.show();
                                          }}
                                          title="Version History"
                                        >
                                          <i className="fas fa-history text-white"></i>
                                        </button>
                                        {research.status === RESEARCH_STATUS.PENDING && (
                                          <button 
                                            className="btn btn-sm btn-danger"
                                            onClick={() => handleDelete(research)}
                                            title="Delete"
                                          >
                                            <i className="fas fa-trash text-white"></i>
                                          </button>
                                        )}
                                        {research.status === RESEARCH_STATUS.REVISE && (
                                          <button
                                            className="btn btn-sm btn-success"
                                            onClick={() => handleResubmitClick(research)}
                                            data-bs-toggle="modal"
                                            data-bs-target="#resubmitModal"
                                            title="Resubmit"
                                          >
                                            <i className="fas fa-upload text-white"></i>
                                          </button>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Research Modal */}
              <div className="modal fade" id="submitResearchModal" tabIndex="-1" aria-labelledby="submitResearchModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-lg">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title" id="submitResearchModalLabel">New Research</h5>
                      <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                      <form className="research-form" onSubmit={handleSubmit}>
                        <div className="mb-3">
                          <label htmlFor="title" className="form-label" style={{marginLeft: '5%'}}>Research Title</label>
                          <input
                            type="text"
                            className="form-control"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            required
                            style={{width: '90%', marginLeft: '5%'}}
                          />
                        </div>

                        <div className="mb-3">
                          <label htmlFor="authors" className="form-label">Authors</label>
                          <input
                            type="text"
                            className="form-control"
                            id="authors"
                            name="authors"
                            value={formData.authors}
                            onChange={handleInputChange}
                            required
                            readOnly={teamInfo !== null}
                          />
                          {teamInfo && (
                            <small className="text-muted">
                              Authors are automatically set based on your team members
                            </small>
                          )}
                        </div>

                        <div className="row">
                          <div className="col-md-7">
                            <div className="mb-3">
                              <label htmlFor="abstract" className="form-label">Abstract</label>
                              <textarea
                                className="form-control"
                                id="abstract"
                                name="abstract"
                                rows="8"
                                value={formData.abstract}
                                onChange={handleInputChange}
                                required
                              ></textarea>
                            </div>
                          </div>

                          <div className="col-md-5">
                            <div className="mb-3">
                              <label htmlFor="keywords" className="form-label">Keywords</label>
                              <input
                                type="text"
                                className="form-control"
                                id="keywords"
                                name="keywords"
                                value={formData.keywords}
                                onChange={handleInputChange}
                                placeholder="Separate keywords with commas"
                                required
                              />
                            </div>

                            <div className="mb-3">
                              <label htmlFor="uploadDate" className="form-label">Upload Date</label>
                              <input
                                type="date"
                                className="form-control"
                                id="uploadDate"
                                name="uploadDate"
                                value={formData.uploadDate}
                                readOnly
                                disabled
                                style={{ backgroundColor: '#e9ecef' }}
                              />
                            </div>

                            <div className="mb-3">
                              <button 
                                type="button" 
                                className="btn btn-success w-60" 
                                data-bs-toggle="modal" 
                                data-bs-target="#fileUploadModal"
                                data-bs-dismiss="modal"
                              >
                                Select File
                              </button>
                              <small className="form-text text-muted d-block mt-2">
                                The file must be in PDF format
                              </small>
                            </div>
                          </div>
                        </div>

                        <div className="modal-footer">
                          <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                          <button type="submit" className="btn btn-success">Submit Research</button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal for file upload */}
              <div 
                className="modal fade" 
                id="fileUploadModal" 
                tabIndex="-1" 
                aria-labelledby="fileUploadModalLabel" 
                aria-hidden="true"
                data-bs-backdrop="static"
              >
                <div className="modal-dialog modal-dialog-centered">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title" id="fileUploadModalLabel">Upload File</h5>
                      <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                      <input type="file" className="form-control mb-3" onChange={handleFileChange} />
                      <div
                        className="drop-zone"
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        style={{
                          border: '2px dashed #ccc',
                          borderRadius: '5px',
                          padding: '20px',
                          textAlign: 'center',
                          cursor: 'pointer'
                        }}
                      >
                        Drag & Drop your file here
                      </div>
                      {file && <p className="mt-2">Selected file: {file.name}</p>}
                    </div>
                    <div className="modal-footer">
                      <button 
                        type="button" 
                        className="btn btn-secondary" 
                        data-bs-dismiss="modal"
                        data-bs-toggle="modal"
                        data-bs-target="#submitResearchModal"
                      >
                        Close
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-primary" 
                        data-bs-dismiss="modal"
                        data-bs-toggle="modal"
                        data-bs-target="#submitResearchModal"
                        style={{
                          background: '#4CAF50', 
                          color: 'white', 
                          border: 'none'
                        }}
                      >
                        Save changes
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* View Research Modal */}
              <div className="modal fade" id="viewResearchModal" tabIndex="-1" aria-labelledby="viewResearchModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-lg">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title" id="viewResearchModalLabel">Research Details</h5>
                      <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                      {selectedResearch && (
                        <div className="container">
                          <div className="row mb-3">
                            <div className="col-12">
                              <h4>{selectedResearch.title}</h4>
                              <span className={`badge bg-${
                                selectedResearch.status === RESEARCH_STATUS.APPROVED ? 'success' :
                                selectedResearch.status === RESEARCH_STATUS.PENDING ? 'warning' :
                                selectedResearch.status === RESEARCH_STATUS.REVISE ? 'info' : 'danger'
                              } mb-2`}>
                                {selectedResearch.status}
                              </span>
                            </div>
                          </div>

                          {selectedResearch.status === RESEARCH_STATUS.REVISE && selectedResearch.note && (
                            <div className="row mb-3">
                              <div className="col-12">
                                <div className="alert alert-info">
                                  <h6 className="mb-2"><i className="fas fa-comment-dots me-2"></i>Revision Instructions:</h6>
                                  <p className="mb-0">{selectedResearch.note}</p>
                                </div>
                              </div>
                            </div>
                          )}

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
                                <span className="me-2">{selectedResearch.fileName}</span>
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
                                <p><strong>Comments:</strong></p>
                                <p>{selectedResearch.comments}</p>
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

              {/* Alert Component */}
              {showAlert && (
                <div 
                  className={`alert alert-${alertType} alert-dismissible fade show position-fixed`}
                  role="alert"
                  style={{
                    top: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 1050,
                    minWidth: '300px',
                    maxWidth: '500px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  {alertType === 'success' && <i className="fas fa-check-circle me-2"></i>}
                  {alertType === 'danger' && <i className="fas fa-exclamation-circle me-2"></i>}
                  {alertType === 'warning' && <i className="fas fa-exclamation-triangle me-2"></i>}
                  {alertMessage}
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setShowAlert(false)}
                  ></button>
                </div>
              )}

              {/* Updated Confirmation Modal */}
              {showConfirmModal && (
                <div className="modal fade show" 
                     style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} 
                     tabIndex="-1">
                  <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title">
                          {pendingAction?.type === 'submit' ? 'Submit Research' : 
                           pendingAction?.type === 'delete' ? 'Delete Research' : 'Confirm Action'}
                        </h5>
                        <button 
                          type="button" 
                          className="btn-close" 
                          onClick={() => {
                            setShowConfirmModal(false);
                            setPendingAction(null);
                            setResearchToDelete(null);
                          }}
                        ></button>
                      </div>
                      <div className="modal-body">
                        {pendingAction?.type === 'delete' ? (
                          <div>
                            <p className="text-danger">
                              <i className="fas fa-exclamation-triangle me-2"></i>
                              Are you sure you want to delete this research?
                            </p>
                            <p className="fw-bold mb-1">{researchToDelete?.title}</p>
                            <p className="text-muted small">This action cannot be undone.</p>
                          </div>
                        ) : (
                          <p>Are you sure you want to submit this research paper?</p>
                        )}
                      </div>
                      <div className="modal-footer">
                        <button 
                          type="button" 
                          className="btn btn-secondary" 
                          onClick={() => {
                            setShowConfirmModal(false);
                            setPendingAction(null);
                            setResearchToDelete(null);
                          }}
                        >
                          Cancel
                        </button>
                        <button 
                          type="button" 
                          className={`btn ${pendingAction?.type === 'delete' ? 'btn-danger' : 'btn-success'}`}
                          onClick={handleConfirmedAction}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              {pendingAction?.type === 'delete' ? 'Deleting...' : 'Submitting...'}
                            </>
                          ) : (
                            pendingAction?.type === 'delete' ? 'Delete' : 'Confirm'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Resubmit Modal */}
              <div className="modal fade" id="resubmitModal" tabIndex="-1">
                <div className="modal-dialog modal-lg">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">Resubmit Research</h5>
                      <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div className="modal-body">
                      <form onSubmit={handleResubmit}>
                        <div className="mb-3">
                          <label className="form-label">Revision Note from Instructor:</label>
                          <div className="alert alert-info">
                            {selectedResearch?.note}
                          </div>
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Updated Research File (PDF)</label>
                          <input
                            type="file"
                            className="form-control"
                            accept=".pdf"
                            onChange={handleFileChange}
                            required
                          />
                        </div>
                      </form>
                    </div>
                    <div className="modal-footer">
                      <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                      <button 
                        type="button" 
                        className="btn btn-primary"
                        onClick={handleResubmit}
                        disabled={isResubmitting || !file}
                      >
                        {isResubmitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Resubmitting...
                          </>
                        ) : (
                          'Resubmit Research'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Version History Modal */}
              <div className="modal fade" id="versionHistoryModal" tabIndex="-1">
                <div className="modal-dialog modal-lg">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">Version History</h5>
                      <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div className="modal-body">
                      {selectedResearch && (
                        <>
                          <h6 className="mb-3">Research Title: {selectedResearch.title}</h6>
                          <div className="table-responsive">
                            <table className="table table-hover">
                              <thead>
                                <tr>
                                  <th>Version</th>
                                  <th>Upload Date</th>
                                  <th>Status</th>
                                  <th>Notes</th>
                                  <th>File</th>
                                </tr>
                              </thead>
                              <tbody>
                                {versionHistory.map((version) => (
                                  <tr key={version._id}>
                                    <td>v{version.version || 1}</td>
                                    <td>
                                      {new Date(version.uploadDate).toLocaleDateString('en-US', {
                                        month: '2-digit',
                                        day: '2-digit',
                                        year: 'numeric'
                                      })}
                                    </td>
                                    <td>
                                      <span className={`badge bg-${
                                        version.status === 'Accepted' ? 'success' :
                                        version.status === 'Pending' ? 'warning' :
                                        version.status === 'Revision' ? 'info' : 'danger'
                                      }`}>
                                        {version.status}
                                      </span>
                                    </td>
                                    <td>
                                      {version.note || '-'}
                                    </td>
                                    <td>
                                      <a 
                                        href={`https://drive.google.com/file/d/${version.driveFileId}/view`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-sm btn-primary"
                                      >
                                        <i className="fas fa-external-link-alt me-1"></i>
                                        View File
                                      </a>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="modal-footer">
                      <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
export default MyResearch;