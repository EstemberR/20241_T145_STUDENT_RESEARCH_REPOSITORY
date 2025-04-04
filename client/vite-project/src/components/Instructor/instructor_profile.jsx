import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './resources/Sidebar';
import Header from './resources/Header';
import { getUserName, getToken } from './resources/Utils';
import { useUser } from './resources/userContext'; // Import useUser
import LoadingWithNetworkCheck from '../common/LoadingWithNetworkCheck';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Dashboard.css';
import '../css/Dashboard2.css';
import '../css/admin_dashboard.css';
import '../css/UserProfile.css';
import ProfileCalendar from '../ProfileCalendar';

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
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  const [profilePic, setProfilePic] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = getToken();
        if (!token) {
          setAlert({
            show: true,
            message: 'Please log in first.',
            type: 'danger'
          });
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
          setAlert({
            show: true,
            message: data.message || 'Error fetching profile',
            type: 'danger'
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate, updateUserName]);

  useEffect(() => {
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
    try {
      const token = localStorage.getItem('token'); // Get the token from local storage
      if (!token) {
        setAlert({
          show: true,
          message: 'Please log in first.',
          type: 'danger'
        });
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
        setAlert({
          show: true,
          message: 'Profile updated successfully',
          type: 'success'
        });
        setIsEditing(false); // Exit edit mode
        updateUserName(data.name);
      } else {
        setAlert({
          show: true,
          message: data.message || 'Error updating profile',
          type: 'danger'
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  // Helper function to format roles
  const formatRoles = (roles) => {
    if (!roles) return '';
    if (Array.isArray(roles)) {
      return roles.map(role => 
        role.charAt(0).toUpperCase() + role.slice(1)
      ).join(' • ');
    }
    return roles;
  };

  // Helper function to get role badges
  const getRoleBadges = (roles) => {
    if (!roles) return null;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    
    return roleArray.map((role, index) => (
      <span 
        key={index} 
        className={`badge ${role === 'adviser' ? 'bg-primary' : 'bg-success'} me-2`}
        style={{ fontSize: '0.9em' }}
      >
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    ));
  };

  if (loading) {
    return (
      <div className="dashboard-container d-flex">
        <Sidebar />
        <div className="main-section col-10 d-flex flex-column">
          <Header userName={userName} userRole={profile?.role || ''} />
          <LoadingWithNetworkCheck />
        </div>
      </div>
    );
  }

  if (!profile) {
    return <div>Loading...</div>; // Wait until profile data is loaded
  }
  return (
    <div className="dashboard-container d-flex">
      {alert.show && (
        <div 
          className={`alert alert-${alert.type} alert-dismissible fade show position-fixed start-50 translate-middle-x mt-3`} 
          role="alert" 
          style={{ 
            maxWidth: '500px', 
            zIndex: 1000,
            top: '20px'
          }}
        >
          {alert.message}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setAlert({ ...alert, show: false })}
          ></button>
        </div>
      )}
      <Sidebar />
      <div className="main-section col-10 d-flex flex-column">
        <Header userName={userName} userRole={profile.role} />
        <main className="main-content">
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

                {/* Right Column */}
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
                              <span className="text-success">Roles</span>
                            </div>
                            <div className="col-8">
                              {getRoleBadges(profile.role)}
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
                <ProfileCalendar userRole="instructor" />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default InstructorProfile;
