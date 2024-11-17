import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './resources/Sidebar';
import Header from './resources/Header';
import { getToken } from './resources/Utils';
import { useUser } from './resources/userContext'; // Import useUser
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Dashboard.css';
import '../css/Dashboard2.css';
import '../css/admin_dashboard.css';
import '../css/UserProfile.css';

const InstructorProfile = () => {
  const { userName, updateUserName } = useUser(); // Get userName and updateUserName
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState({
    name: '',
    email: '',
    role: ''
  });
  const navigate = useNavigate();

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

        const response = await fetch('http://localhost:8000/instructor/profile', {
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
    try {
      const token = localStorage.getItem('token'); // Get the token from local storage
      if (!token) {
        alert('Please log in first.');
        navigate('/');
        return;
      }

      const response = await fetch('http://localhost:8000/instructor/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Include the token in the request headers
        },
        body: JSON.stringify(user),
      });

      const data = await response.json();
      if (response.ok) {
        setProfile(data); // Update profile state with new data
        alert('Profile updated successfully');
        setIsEditing(false); // Exit edit mode
        updateUserName(data.name);
      } else {
        alert(data.message || 'Error updating profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (!profile) {
    return <div>Loading...</div>; // Wait until profile data is loaded
  }
  return (
    <div className="dashboard-container d-flex">
      <Sidebar />
      <div className="main-section col-10 d-flex flex-column">
        <Header userName={userName} />
        <main className="main-content">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <div className="row">
                {/* Left Column - Profile Image and Basic Info */}
                <div className="col-md-4 border-end text-center">
                  <div className="position-relative mb-4">
                    <img
                      src={'https://via.placeholder.com/150'}
                      alt="Profile"
                      className="rounded-circle shadow"
                      style={{ 
                        width: '150px', 
                        height: '150px',
                        border: '4px solid #fff'
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
                          <div className="row">
                            <div className="col-4">
                              <span className="text-success">Role</span>
                            </div>
                            <div className="col-8">
                              <strong>{profile.role}</strong>
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
        </main>
      </div>
    </div>
  );
};

export default InstructorProfile;
