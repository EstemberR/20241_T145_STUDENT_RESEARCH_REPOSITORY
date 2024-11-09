import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import casLogo from '../../assets/cas-logo.png';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Dashboard.css';

const MyResearch = () => {
  const location = useLocation();
  const [userName, setUserName] = useState('');
  const [file, setFile] = useState(null);
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
    const storedName = localStorage.getItem('userName');
    if (storedName) {
      setUserName(storedName);
    }
  }, []);

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
      <nav className="col-2 sidebar">
        <h3 className="text-center">STUDENT RESEARCH REPOSITORY SYSTEM</h3>
        <ul className="nav flex-column">
          <li className="nav-item">
            <Link className={`nav-link ${location.pathname === '/student/dashboard' ? 'active' : ''}`} to="/student/dashboard">
              <i className="fas fa-tachometer-alt search zx"></i> Dashboard
            </Link>
          </li>
          <li className="nav-item">
            <Link className={`nav-link ${location.pathname === '/student/repository' ? 'active' : ''}`} to="/student/repository">
              <i className="fas fa-book search zx"></i> Research Repository
            </Link>
          </li>
          <li className="nav-item">
            <Link className={`nav-link ${location.pathname === '/student/profile' ? 'active' : ''}`} to="/student/profile">
              <i className="fas fa-user search zx"></i> User Profile
            </Link>
          </li>
          <li className="nav-item">
            <Link className={`nav-link ${location.pathname === '/student/myResearch' ? 'active' : ''}`} to="/student/myResearch">
              <i className="fas fa-folder-open search zx"></i> My Research
            </Link>
          </li>
          <li className="nav-item">
            <Link className={`nav-link ${location.pathname === '/student/FAQ' ? 'active' : ''}`} to="/student/FAQ">
              <i className="fas fa-robot search zx"></i> FAQ
            </Link>
          </li>
          <li className="nav-item">
            <Link className={`nav-link ${location.pathname === '/student/notifications' ? 'active' : ''}`} to="/student/notifications">
              <i className="fas fa-bell search zx"></i> Notifications
            </Link>
          </li>
          <li className="nav-item">
            <Link className={`nav-link ${location.pathname === '/student/logout' ? 'active' : ''}`} to="/student/logout">
              <i className="fas fa-sign-out-alt search zx"></i> Logout
            </Link>
          </li>
        </ul>
      </nav>

      <div className="main-section col-10 d-flex flex-column">
        <div className="top-row d-flex align-items-center">
          <header className="col-8 d-flex justify-content-center align-items-center">
            <img src={casLogo} alt="CAS Logo" className="cas-logo" />
          </header>
          <div className="col-2 user-info ms-auto d-flex align-items-center">
            <img
              src={'https://via.placeholder.com/150'}
              alt="Profile"
              className="img-fluid rounded-circle"
              style={{ width: '50px', height: '50px' }}
            />
            <div className="user-details">
              <p className="user-name">{userName}</p>
              <p className="user-role">Student</p>
            </div>
          </div>
        </div>

        <main className="main-content p-4">
          <h2 className="mb-4">Submit Research</h2>
          <form className="research-form" onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="title" className="form-label">Research Title</label>
              <input
                type="text"
                className="form-control"
                id="title"
                name="title"
                value={researchData.title}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="authors" className="form-label">Authors</label>
              <input
                type="text"
                className="form-control"
                id="authors"
                name="authors"
                value={researchData.authors}
                onChange={handleInputChange}
                placeholder="Separate multiple authors with commas"
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="abstract" className="form-label">Abstract</label>
              <textarea
                className="form-control"
                id="abstract"
                name="abstract"
                rows="6"
                value={researchData.abstract}
                onChange={handleInputChange}
                required
              ></textarea>
            </div>

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

            <div className="row mb-3">
              <div className="col-md-6">
                <label htmlFor="status" className="form-label">Research Status</label>
                <select
                  className="form-select"
                  id="status"
                  name="status"
                  value={researchData.status}
                  onChange={handleInputChange}
                  required>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="revise">Revise</option>
                  <option value="approved">Approved</option>
                </select>
              </div>

              <div className="col-md-6">
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
            </div>

            {/* Button to trigger modal */}
            <button type="button" className="btn btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#fileUploadModal" 
            style={{background: '#4CAF50', color: 'white'}}>
              Select File
            </button>

            <div className="mt-1">
              <small className="form-text text-muted">
                The file must be in PDF format
              </small>
            </div>
            <button type="submit" className="btn btn-primary">
              Submit
            </button>
          </form>
        </main>
      </div>

      {/* Modal for file upload */}
      <div className="modal fade" id="fileUploadModal" tabIndex="-1" aria-labelledby="fileUploadModalLabel" aria-hidden="true">
        <div className="modal-dialog">
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
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button type="button" className="btn btn-primary" data-bs-dismiss="modal">Save changes</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyResearch;