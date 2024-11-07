import casLogo from '../../assets/cas-logo.jpg'; 
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Dashboard.css';
import '../css/UserProfile.css';

const Profile = () => {
  const location = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  
  const [user, setUser] = useState({
    studentId: '2201102944',
    firstName: 'Merryl',
    middleName: 'M.',
    lastName: 'Strife',
    email: 'merryl@student.buksu.edu.ph',
    contactNumber: '0912-345-6789',
    address: '123 Main St, Anytown, Philippines',
    course: 'Bachelor of Science in Computer Science',
    birthDate: '2000-01-01',
    profilePicture: 'https://via.placeholder.com/150', 
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({ ...prevUser, [name]: value }));
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Updated user info:", user);
    handleEditToggle(); 
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
            <div className="user-details">
              <p className="user-name">Merryl Strife</p>
              <p className="user-role">Student</p>
            </div>
          </div>
        </div>
{/*---------------------------------END OF HEADER TEMPLATE----------------------------------------------------*/}
        {/* Main Content Area */}
        <main className="main-content">
          <div className="container mt-5">
            <div className="row">
              <div className="col-md-4 text-center">
                <img
                  src={user.profilePicture}
                  alt="Profile"
                  className="img-fluid rounded-circle mb-3"
                  style={{ width: '150px', height: '150px' }}
                />
                <h3>{`${user.firstName} ${user.middleName} ${user.lastName}`}</h3>
                <p className="text-muted">{user.email}</p>
                <button className="search1" onClick={handleEditToggle} style={{width: "100px", height: "40px"}}>
                  {isEditing ? 'Cancel' : 'Edit'}
                </button>
              </div>
              <div className="col-md-8">
                {isEditing ? (
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label className="form-label">First Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="firstName"
                        value={user.firstName}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Middle Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="middleName"
                        value={user.middleName}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Last Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="lastName"
                        value={user.lastName}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={user.email}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Contact Number</label>
                      <input
                        type="text"
                        className="form-control"
                        name="contactNumber"
                        value={user.contactNumber}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Address</label>
                      <input
                        type="text"
                        className="form-control"
                        name="address"
                        value={user.address}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Course</label>
                      <input
                        type="text"
                        className="form-control"
                        name="course"
                        value={user.course}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Birth Date</label>
                      <input
                        type="date"
                        className="form-control"
                        name="birthDate"
                        value={user.birthDate}
                        onChange={handleChange}
                      />
                    </div>
                    <button type="submit" className="btn btn-success">
                      Save Changes
                    </button>
                  </form>
                ) : (
                  <div>
                    <h4>Student Information</h4>
                    <p><strong>Contact Number:</strong> {user.contactNumber}</p>
                    <p><strong>Address:</strong> {user.address}</p>
                    <p><strong>Course:</strong> {user.course}</p>
                    <p><strong>Birth Date:</strong> {user.birthDate}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;
