import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './resources/Sidebar';
import Header from './resources/Header';
import { Link } from 'react-router-dom';
import { getUserName, getToken } from './resources/Utils';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Dashboard.css';

const MyResearch = () => {
  const navigate = useNavigate();
  const [userName] = useState(getUserName());
  const [file, setFile] = useState(null);


  // Add new state for research entries
  const [researchEntries, setResearchEntries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [researchData, setResearchData] = useState({
    title: '',
    abstract: '',
    authors: '',
    keywords: '',
    driveLink: '',
    status: 'pending',
    uploadDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const token = getToken();
    if (!token) {
      alert('Please log in first.');
      localStorage.removeItem('userName');
      localStorage.removeItem('token');
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      const cachedEntries = localStorage.getItem('researchEntries');
      if (cachedEntries) {
        setResearchEntries(JSON.parse(cachedEntries));
      }
      return;
    }

    const fetchDriveFiles = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/auth/google-drive/list', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const files = await response.json();
          // Transform the files data to match your research entries format
          const formattedEntries = files.map(file => ({
            title: file.name,
            driveLink: file.id,
            fileName: file.name,
            submissionDate: new Date(file.createdTime).toLocaleDateString(),
            status: 'pending',
            // Add other default fields as needed
          }));

          setResearchEntries(formattedEntries);
          localStorage.setItem('researchEntries', JSON.stringify(formattedEntries));
        }
      } catch (error) {
        console.error('Error fetching Drive files:', error);
        // Fallback to cached entries
        const cachedEntries = localStorage.getItem('researchEntries');
        if (cachedEntries) {
          setResearchEntries(JSON.parse(cachedEntries));
        }
      }
    };

    fetchDriveFiles();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setResearchData(prevData => ({
      ...prevData,
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

    console.log('Preparing to upload file:', file.name); // Debug log

    const formData = new FormData();
    formData.append('file', file);

    console.log('Sending request to server...'); // Debug log

    const response = await fetch('http://localhost:8000/api/auth/google-drive', {
      method: 'POST',
      body: formData,
    });

    console.log('Response status:', response.status); // Debug log

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Server response:', result); // Debug log

     // Create new research entry with all data
     const newResearch = {
      ...researchData,
      driveLink: result.fileId,
      fileName: file.name,
      submissionDate: new Date().toLocaleDateString()
    };

     // Add to research entries
     setResearchEntries([...researchEntries, newResearch]);
      
     // Reset form
     setResearchData({
       title: '',
       abstract: '',
       authors: '',
       keywords: '',
       driveLink: '',
       status: 'pending',
       uploadDate: new Date().toISOString().split('T')[0]
     });
     setFile(null);
     setShowForm(false);

    setResearchData(prevData => ({
      ...prevData,
      driveLink: result.fileId
    }));
    
    alert('File uploaded successfully!');
  } catch (error) {
    console.error('Error during file upload:', error);
    alert(`Error uploading file: ${error.message}`);
  }
  };

  
  return (
    <div className="dashboard-container d-flex">
      <Sidebar />
      <div className="main-section col-10 d-flex flex-column">
        <Header userName={userName} />

        <main className="main-content p-4">
          {/* Research Table Section */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="page-title">List of Research</h2>
            <button 
              className="btn btn-success" 
              data-bs-toggle="modal" 
              data-bs-target="#submitResearchModal"
            >
              <i className="fas fa-plus me-2"></i>Add New Research
            </button>
          </div>

          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item"><Link to="/student/dashboard">Dashboard</Link></li>
              <li className="breadcrumb-item active">Research List</li>
            </ol>
          </nav>

          {/* Your existing table code */}
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Authors</th>
                  <th>Keywords</th>
                  <th>File</th> {/* Added File column */}
                  <th>Status</th>
                  <th>Submission Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {researchEntries.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4">
                      No research entries found. Click "Add New Research" to submit your first entry.
                    </td>
                  </tr>
                ) : (
                  researchEntries.map((research, index) => (
                    <tr key={index}>
                      <td>{research.title}</td>
                      <td>{research.authors}</td>
                      <td>{research.keywords}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <i className="fas fa-file-pdf text-danger me-2"></i>
                          {research.fileName || 'research.pdf'}
                          <a 
                            href={`https://drive.google.com/file/d/${research.driveLink}/view`}
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
                          research.status === 'approved' ? 'success' :
                          research.status === 'pending' ? 'warning' :
                          research.status === 'revise' ? 'danger' : 'info'
                        }`}>
                          {research.status}
                        </span>
                      </td>
                      <td>{research.submissionDate}</td>
                      <td>
                        <button 
                          className="btn btn-sm btn-info me-2"
                          onClick={() => window.open(`https://drive.google.com/file/d/${research.driveLink}/view`, '_blank')}
                        >
                          <i className="fas fa-eye"></i> View
                        </button>
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
                        value={researchData.title}
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
                        value={researchData.authors}
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
                            value={researchData.abstract}
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
                            value={researchData.keywords}
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
                            value={researchData.status}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="pending">Pending</option>
                            <option value="in-progress">In Progress</option>
                            <option value="revise">Revise</option>
                            <option value="approved">Approved</option>
                          </select>
                        </div>

                        <div className="mb-3">
                          <label htmlFor="uploadDate" className="form-label">Upload Date</label>
                          <input
                            type="date"
                            className="form-control"
                            id="uploadDate"
                            name="uploadDate"
                            value={researchData.uploadDate}
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
        </main>
      </div>
    </div>
  );
};
export default MyResearch;