import casLogo from '../../assets/cas-logo.jpg'; 
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Dashboard.css';
import '../css/Dashboard2.css';
import '../css/admin_dashboard.css';

const InstructorStudents = () => {
  const location = useLocation();
  const studentData = [
    { id: 1, name: "Maria Perez", email: "maria.perez@example.com", course: "Computer Science", researchTitle: "AI in Smart Parking Systems", status: "Approved" },
    { id: 2, name: "John Doe", email: "john.doe@example.com", course: "Information Technology", researchTitle: "IoT-based Emission Monitoring", status: "Pending" },
    { id: 3, name: "Alice Johnson", email: "alice.johnson@example.com", course: "Engineering", researchTitle: "Vehicle Speed Sensor Development", status: "In Progress" },
  ];

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

        <main className="main-content ">
        <div className="container mt-4 notify">
            <h4>STUDENT PROFILES</h4>
            <div className="container">
                <div className="row">
                {/* Example of a single student profile card */}
                {studentData.map((student, index) => (
                    <div className="col-md-4 mb-4" key={index}>
                    <div className="card h-100 shadow-sm">
                    <div className="card h-100 shadow-sm">
                    <div className="card-body d-flex align-items-center">
                        <img
                        src="https://via.placeholder.com/50"
                        alt="Profile"
                        className="rounded-circle me-3 studProfile"
                        width="50"
                        height="50"   
                        />
                        <div>
                        <h5 className="card-title mb-1">{student.name}</h5>
                        <p className="card-text"><strong>Email:</strong> {student.email}</p>
                        <p className="card-text"><strong>Course:</strong> {student.course}</p>
                        <p className="card-text"><strong>Research Title:</strong> {student.researchTitle}</p>
                        <p className="card-text"><strong>Status:</strong> {student.status}</p>
                        </div>
                    </div>
                    <Link to={`/instructor/student/${student.id}`} className="btn btn-primary mt-2 w-100">
                        View Details
                    </Link>
                    </div>
                    

                    </div>
                    </div>
                ))}
                </div>
            </div>
            </div>
        </main>
      </div>
    </div>
  );
};

export default InstructorStudents;
