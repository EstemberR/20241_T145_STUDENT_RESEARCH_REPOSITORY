import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './resources/Sidebar';
import Header from './resources/Header';
import { Link } from 'react-router-dom';
import { getUserName, getToken } from './resources/Utils';
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

  const fetchResearchEntries = async () => {
    try {
      const token = getToken();
      if (!token) {
        alert('Please log in first.');
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
      alert(`Error fetching research entries: ${error.message}`);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (!file) {
        alert('Please select a file to upload.');
        return;
      }

      if (!studentInfo) {
        alert('Student information not loaded yet. Please try again.');
        return;
      }

      // First upload file
      const fileFormData = new FormData();
      fileFormData.append('file', file);

      const fileUploadResponse = await fetch('http://localhost:8000/api/auth/google-drive', {
        method: 'POST',
        body: fileFormData,
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
          authors: formData.authors,
          keywords: formData.keywords,
          fileUrl: `https://drive.google.com/file/d/${fileResult.fileId}/view`,
          driveFileId: fileResult.fileId,
          uploadDate: formData.uploadDate
        })
      });

      if (!researchSubmitResponse.ok) {
        throw new Error('Failed to submit research');
      }

      const savedResearch = await researchSubmitResponse.json();
      console.log('Research saved:', savedResearch);

      // Reset form
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

      // Close modal
      const modal = document.getElementById('submitResearchModal');
      if (modal) {
        const bootstrapModal = bootstrap.Modal.getInstance(modal);
        if (bootstrapModal) {
          bootstrapModal.hide();
        }
      }

      // Refresh research entries
      await fetchResearchEntries();
      
      alert('Research submitted successfully!');
    } catch (error) {
      console.error('Error submitting research:', error);
      alert(`Error submitting research: ${error.message}`);
    }
  };

  const handleViewResearch = (research) => {
    setSelectedResearch(research);
  };

  return (
    <div className="dashboard-container d-flex">
      <Sidebar />
      <div className="main-section col-10 d-flex flex-column">
        <Header userName={userName} />

        <main className="main-content p-4">
          {/* Research Table Section */}
          <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="my-3">STUDENT SUBMISSIONS</h4>
          <button 
              className="btn btn-success" 
              data-bs-toggle="modal" 
              data-bs-target="#submitResearchModal"
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
                              <th>Title</th>
                              <th>Authors</th>
                              <th>Keywords</th>
                              <th>File</th>
                              <th>Status</th>
                              <th>Submission Date</th>
                              <th>View</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {researchEntries.filter(research => research.status === status).length === 0 ? (
                              <tr>
                                <td colSpan="6" className="text-center py-4">
                                  No research entries found in this category.
                                </td>
                              </tr>
                            ) : (
                              researchEntries
                                .filter(research => research.status === status)
                                .map((research, index) => (
                                  <tr key={index}>
                                    <td>{research.title}</td>
                                    <td>{research.authors}</td>
                                    <td>{research.keywords}</td>
                                    <td>
                                      <div className="d-flex align-items-center">
                                        <i className="fas fa-file-pdf text-danger me-2"></i>
                                        {research.fileName || 'research.pdf'}
                                        <a 
                                          href={`https://drive.google.com/file/d/${research.driveFileId}/view`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="ms-2"
                                        >
                                          <i className="fas fa-download text-primary"></i>
                                        </a>
                                      </div>
                                    </td>
                                    <td>
                                      <span className={`badge bg-${
                                      research.status === RESEARCH_STATUS.APPROVED ? 'success' :
                                      research.status === RESEARCH_STATUS.PENDING ? 'warning' :
                                      research.status === RESEARCH_STATUS.REVISE ? 'info' : 'danger'
                                    } mb-2`}>
                                      {research.status}
                                    </span>
                                    </td>
                                    <td>
                                      {new Date(research.uploadDate).toLocaleDateString('en-US', {
                                        month: '2-digit',
                                        day: '2-digit',
                                        year: 'numeric'
                                      })}
                                    </td>
                                    <td>
                                      <button 
                                          className="btn btn-sm btn-info me-2"
                                          onClick={() => handleViewResearch(research)}
                                          data-bs-toggle="modal"
                                          data-bs-target="#viewResearchModal"
                                        >
                                          <i className="fas fa-eye"></i> View
                                        </button>
                                    </td>
                                    <td>
                                      <button 
                                        className="btn btn-sm btn-secondary"
                                        onClick={() => {/* Add edit functionality */}}
                                      >
                                        <i className="fas fa-edit"></i> Edit
                                      </button>
                                    </td>
                                  </tr>
                                ))
                            )}
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
                      <label htmlFor="authors" className="form-label" style={{marginLeft: '5%'}}>Authors</label>
                      <input
                        type="text"
                        className="form-control"
                        id="authors"
                        name="authors"
                        value={formData.authors}
                        onChange={handleInputChange}
                        placeholder="Separate multiple authors with commas"
                        required
                        style={{width: '90%', marginLeft: '5%'}}
                      />
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
                          <label htmlFor="status" className="form-label">Research Status</label>
                          <select
                            className="form-select"
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={handleInputChange}
                            required
                          >
                            <option value={RESEARCH_STATUS.PENDING}>{RESEARCH_STATUS.PENDING}</option>
                            <option value={RESEARCH_STATUS.APPROVED}>{RESEARCH_STATUS.APPROVED}</option>
                            <option value={RESEARCH_STATUS.REVISE}>{RESEARCH_STATUS.REVISE}</option>
                            <option value={RESEARCH_STATUS.REJECTED}>{RESEARCH_STATUS.REJECTED}</option>
                          </select>
                        </div>

                        <div className="mb-3">
                          <label htmlFor="uploadDate" className="form-label">Upload Date</label>
                          <input
                            type="date"
                            className="form-control"
                            id="uploadDate"
                            name="uploadDate"
                            value={formData.uploadDate}
                            onChange={handleInputChange}
                            required
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
        </main>
      </div>
    </div>
  );
};
export default MyResearch;