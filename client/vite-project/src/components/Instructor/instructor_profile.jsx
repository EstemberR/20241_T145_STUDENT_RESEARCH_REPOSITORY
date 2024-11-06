import casLogo from '../../assets/cas-logo.jpg'; 
import React, {useState} from 'react';
import { Link, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Dashboard.css';
import '../css/Dashboard2.css';
import '../css/admin_dashboard.css';

const InstructorProfile = () => {
  const location = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  
  const [user, setUser] = useState({
    studentId: '2201102944',
    firstName: 'Jonard',
    middleName: 'M.',
    lastName: 'Sanico',
    email: 'jonard@buksu.edu.ph',
    contactNumber: '0912-345-6789',
    address: '123 Main St, Anytown, Philippines',
    course: 'College of Arts and Sciences',
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
        <h3 className="text-center x">INSTRUCTOR VIEW RESEARCH REPOSITORY</h3>
        <ul className="nav flex-column">
          <li className="nav-item">
          <Link className={`nav-link ${location.pathname === '/instructor/instructor_dashboard' ? 'active' : ''}`} to="/instructor/instructor_dashboard">
              <i className="fas fa-tachometer-alt dashboard zx"></i> Dashboard
            </Link>
          </li>
          <li className="nav-item">
          <Link className={`nav-link ${location.pathname === '/instructor/submissions' ? 'active' : ''}`} to="/instructor/submissions">
          <i className="fas fa-file-alt submission zx"></i> Student Submissions
            </Link>
          </li>
          <li className="nav-item">
          <Link className={`nav-link ${location.pathname === '/instructor/profile' ? 'active' : ''}`} to="/instructor/profile">
          <i className="fas fa-user-circle profile zx"></i> Profile
            </Link>
          </li>
          <li className="nav-item">
          <Link className={`nav-link ${location.pathname === '/instructor/requesting' ? 'active' : ''}`} to="/instructor/requesting">
          <i className="fas fa-user-shield request zx"></i> Role Request
            </Link>
          </li>
          <li className="nav-item">
          <Link className={`nav-link ${location.pathname === '/instructor/students' ? 'active' : ''}`} to="/instructor/students">
          <i className="fas fa-users students zx"></i> Student Profiles
            </Link>
          </li>
          <li className="nav-item">
          <Link className={`nav-link ${location.pathname === '/instructor/notifications' ? 'active' : ''}`} to="/instructor/notifications">
          <i className="fas fa-bell notification zx"></i> Notifications
            </Link>
          </li>       
          <li className="nav-item">
            <Link className={`nav-link ${location.pathname === '/logout' ? 'active' : ''}`} to="/logout">
              <i className="fas fa-sign-out-alt logout zx"></i> Logout
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
            <div className="user-details">
              <p className="user-name">JONARD SANICO</p>
              <p className="user-role">Instructor</p>
            </div>
          </div>
        </div>

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
                <button className="search1" onClick={handleEditToggle}>
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
                    <h4>Instructor Information</h4>
                    <p><strong>Contact Number:</strong> {user.contactNumber}</p>
                    <p><strong>Address:</strong> {user.address}</p>
                    <p><strong>Department:</strong> {user.course}</p>
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

export default InstructorProfile;
