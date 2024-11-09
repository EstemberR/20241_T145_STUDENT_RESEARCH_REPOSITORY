import casLogo from '../../assets/cas-logo.jpg'; 
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Dashboard.css';
// Import gapi if using Google API
// import { gapi } from 'gapi-script';

const MyResearch = () => {
  const location = useLocation();
  const [userName, setUserName] = useState('');
  const [researchData, setResearchData] = useState({
    title: '',
    abstract: '',
    authors: '',
    keywords: '',
    driveLink: '',
    status: 'pending'
  });

  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    if (storedName) {
      setUserName(storedName);
    }

    // Initialize Google API if needed
    // function start() {
    //   gapi.client.init({
    //     apiKey: 'YOUR_API_KEY',
    //     clientId: 'YOUR_CLIENT_ID.apps.googleusercontent.com',
    //     scope: 'https://www.googleapis.com/auth/drive.file',
    //     discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
    //   }).then(() => {
    //     const authInstance = gapi.auth2.getAuthInstance();
    //     setIsSignedIn(authInstance.isSignedIn.get());
    //     authInstance.isSignedIn.listen(setIsSignedIn);
    //   });
    // }

    // gapi.load('client:auth2', start);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setResearchData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleAuthClick = () => {
    // gapi.auth2.getAuthInstance().signIn(); 
  };

  const handleSignOutClick = () => {
    // gapi.auth2.getAuthInstance().signOut(); 
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    console.log(files);
    // Implement upload logic if needed
  };

  return (
    <div className="dashboard-container d-flex">
      {/* Sidebar (Occupies full height) */}
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

      {/* Main Section (Top logo row + Main content) */}
      <div className="main-section col-10 d-flex flex-column">
        {/* Top Row (Logo and Right Empty Space) */}
        <div className="top-row d-flex align-items-center">
          <header className="col-8 d-flex justify-content-center align-items-center">
            <img src={casLogo} alt="CAS Logo" className="cas-logo" />
          </header>
          <div className="col-2 user-info ms-auto d-flex align-items-center">
            <img
              src={'https://via.placeholder.com/150'} //STATIC NALANG
              alt="Profile"
              className="img-fluid rounded-circle"
              style={{ width: '50PX', height: '50px' }}
            />
            <div className="user-details">
              <p className="user-name">{userName}</p>
              <p className="user-role">Student</p>
            </div>
          </div>
        </div>
        {/*---------------------------------END OF HEADER TEMPLATE----------------------------------------------------*/}
        {/* Main Content Area */}
        <main className="main-content p-4">
          <h2 className="mb-4">Submit Research</h2>
          <form className="research-form">
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
                  required
                >
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

            {/*FILE INPUT*/}
            <div className="input-group" style={{width: "50%"}}>
             <input type="file" class="form-control" id="inputGroupFile04" aria-describedby="inputGroupFileAddon04" aria-label="Upload"/>
              <button className="btn btn-outline-secondary" type="button" id="inputGroupFileAddon04">Upload</button>
           </div>
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
    </div>
  );
};

export default MyResearch;
