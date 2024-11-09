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
  <div className="container mt-5">
    <div className="row">
      <div className="col-md-4 text-center">
        <img
          src={'https://via.placeholder.com/150'} //STATIC NALANG
          alt="Profile"
          className="img-fluid rounded-circle"
          style={{ width: '150px', height: '150px' }}
        />
        <h3 className="fs-4 mt-3">{profile.name}</h3>
        <p className="text-muted fs-6">{profile.email}</p>
        <button
          className="btn btn-primary mt-3"
          onClick={handleEditToggle}
          style={{ width: '120px', height: '40px', fontSize: '14px' }}
        >
          {isEditing ? 'Cancel Edit' : 'Edit Profile'}
        </button>
      </div>
      <div className="col-md-8">
        {isEditing ? (
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fs-6">Name</label>
              <input
                type="text"
                className="form-control"
                name="name"
                value={user.name}
                onChange={handleChange}
              />
            </div>
            <button type="submit" className="btn btn-success fs-6">
              Save Changes
            </button>
          </form>
        ) : (
          <div>
            <p className="profile-name"><strong>NAME:</strong> {profile.name}</p>
            <p className="profile-name"><strong>EMAIL:</strong> {profile.email}</p>
            <p className="profile-name"><strong>ROLE:</strong> {profile.role}</p>
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
