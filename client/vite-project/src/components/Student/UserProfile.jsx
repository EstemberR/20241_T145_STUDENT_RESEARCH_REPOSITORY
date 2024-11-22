import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './resources/Sidebar';
import Header from './resources/Header';
import { getToken } from './resources/Utils';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useUser } from '../Instructor/resources/userContext';
import '../css/Dashboard.css';
import '../css/UserProfile.css';
import ProfileCalendar from '../ProfileCalendar';
import { alignPropType } from 'react-bootstrap/esm/types';

const COURSES = [
  'BS-MATH',
  'BS-ES',
  'BSDC',
  'BSCD',
  'BS-BIO',
  'AB-SOCSCI',
  'AB-SOCIO',
  'AB-PHILO'
];

const Profile = () => {
  const { userName, updateUserName } = useUser(); // Get userName and updateUserName
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState({
    name: '',
    email: '',
    role: ''
  });
  const [profilePic, setProfilePic] = useState(null);
  const navigate = useNavigate();
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingChanges, setPendingChanges] = useState(null);

  // Helper function for showing alerts
  const showAlertMessage = (message, type) => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 5000);
  };

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = getToken();
        if (!token) {
          alert('Please log in first.');
          localStorage.removeItem('userName');
          localStorage.removeItem('token');
          navigate('/');
          return;
        }

        const response = await fetch('http://localhost:8000/student/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (response.ok) {
          setProfile(data);
          setUser(data);
          updateUserName(data.name);
        } else {
          alert(data.message || 'Error fetching profile');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, [navigate, updateUserName]);

  useEffect(() => {
    // Get profile picture from localStorage
    const photoURL = localStorage.getItem('userPhoto');
    if (photoURL) {
      setProfilePic(photoURL);
    }
  }, []);

  // Toggle Edit Mode
  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowConfirmModal(true);
    setPendingChanges(user);
  };

  // New function to handle confirmed submission
  const handleConfirmedSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showAlertMessage('Please log in first.', 'danger');
        navigate('/');
        return;
      }

      const response = await fetch('http://localhost:8000/student/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(pendingChanges),
      });

      const data = await response.json();
      if (response.ok) {
        setProfile(data);
        showAlertMessage('Profile updated successfully', 'success');
        setIsEditing(false);
        updateUserName(data.name);
      } else {
        showAlertMessage(data.message || 'Error updating profile', 'danger');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showAlertMessage('Error updating profile', 'danger');
    } finally {
      setShowConfirmModal(false);
    }
  };

  if (!profile) {
    return ; //White screen loading // Wait until profile data is loaded
  }

  return (
    <div className="dashboard-container d-flex">
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
          {alertMessage}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setShowAlert(false)}
          ></button>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal fade show" 
             style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} 
             tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Changes</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowConfirmModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to save these changes to your profile?</p>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowConfirmModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-success" 
                  onClick={handleConfirmedSubmit}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Sidebar />
      <div className="main-section col-10 d-flex flex-column">
        <Header userName={userName} />
        <main className="main-content">
          {/* Profile Card */}
          <div className="card shadow-sm mb-4">
            <div className="card-body p-4">
              <div className="row">
                {/* Left Column - Profile Image and Basic Info */}
                <div className="col-md-4 border-end text-center">
                  <div className="position-relative mb-4">
                    <img
                      src={profilePic || 'https://via.placeholder.com/150'}
                      alt="Profile"
                      className="rounded-circle shadow"
                      style={{ 
                        width: '150px', 
                        height: '150px',
                        border: '4px solid #fff',
                        objectFit: 'cover'
                      }}
                    />
                    <div className="mt-3">
                      <h3 className="fw-bold mb-1">{profile.name}</h3>
                      <p className="text-muted mb-3">
                        <i className="fas fa-envelope me-2"></i>
                        {profile.email}
                      </p>
                      <button
                        className="btn btn-success rounded-pill px-4"
                        onClick={handleEditToggle}
                      >
                        <i className={`fas ${isEditing ? 'fa-times' : 'fa-edit'} me-2`}></i>
                        {isEditing ? 'Cancel' : 'Edit Profile'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Column - Profile Details */}
                <div className="col-md-8">
                  <div className="ps-md-4">
                    {isEditing ? (
                      <form onSubmit={handleSubmit} className="profile-edit-form">
                        <h4 className="mb-4 text-success">Edit Profile</h4>
                        <div className="mb-4">
                          <label className="form-label text-muted">Full Name</label>
                          <input
                            type="text"
                            className="form-control form-control-lg"
                            name="name"
                            value={user.name}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="mb-4">
                          <label className="form-label text-muted">Course</label>
                          <select
                            className="form-select form-select-lg"
                            name="course"
                            value={user.course || ''}
                            onChange={handleChange}
                          >
                            <option value="">Select a course</option>
                            {COURSES.map((course) => (
                              <option key={course} value={course}>
                                {course}
                              </option>
                            ))}
                          </select>
                        </div>
                        <button type="submit" className="btn btn-success btn-lg rounded-pill mb-3">
                          <i className="fas fa-save me-2"></i>
                          Save Changes
                        </button>
                      </form>
                    ) : (
                      <div className="profile-info">
                        <h4 className="mb-4 text-success">Profile Information</h4>
                        <div className="profile-detail mb-3 p-3 border rounded bg-light">
                          <div className="row mb-3">
                            <div className="col-4">
                              <span className="text-success">Full Name</span>
                            </div>
                            <div className="col-8">
                              <strong>{profile.name}</strong>
                            </div>
                          </div>
                          <div className="row mb-3">
                            <div className="col-4">
                              <span className="text-success">Email</span>
                            </div>
                            <div className="col-8">
                              <strong>{profile.email}</strong>
                            </div>
                          </div>
                          <div className="row mb-3">
                            <div className="col-4">
                              <span className="text-success">Role</span>
                            </div>
                            <div className="col-8">
                              <strong>{profile.role}</strong>
                            </div>
                          </div>
                          <div className="row mb-3">
                            <div className="col-4">
                              <span className="text-success">Section</span>
                            </div>
                            <div className="col-8">
                              <strong>{profile.section || 'Not Assigned'}</strong>
                            </div>
                          </div>
                          <div className="row">
                            <div className="col-4">
                              <span className="text-success">Course</span>
                            </div>
                            <div className="col-8">
                              <strong>{profile.course || 'Not Selected'}</strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Calendar Card */}
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h4 className="mb-4 text-success">My Calendar</h4>
              <div className="calendar-wrapper">
                <ProfileCalendar />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;
