import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './resources/Sidebar';
import Header from './resources/Header';
import { getUserName, getToken } from './resources/Utils';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Dashboard.css';

const MyResearch = () => {
  const navigate = useNavigate();
  const [userName] = useState(getUserName());
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
    const token = getToken();
    if (!token) {
      alert('Please log in first.');
      localStorage.removeItem('userName');
      localStorage.removeItem('token');
      navigate('/');
    }
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