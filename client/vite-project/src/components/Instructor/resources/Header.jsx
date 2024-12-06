import React, { useState, useEffect } from 'react';
import casLogo from '../../../assets/cas-logo.jpg';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../css/Dashboard.css';
import '../../css/Dashboard2.css';

const Header = ({ userName, userRole }) => {
    const [profilePic, setProfilePic] = useState(null);

    useEffect(() => {
        // Function to get and set profile picture
        const getProfilePic = () => {
            const photoURL = localStorage.getItem('userPhoto');
            if (photoURL && photoURL !== 'undefined' && photoURL !== 'null') {
                setProfilePic(photoURL);
            }
        };

        // Initial load
        getProfilePic();

        // Set up event listener for storage changes
        window.addEventListener('storage', getProfilePic);

        // Cleanup
        return () => {
            window.removeEventListener('storage', getProfilePic);
        };
    }, []);

    // Helper function to format roles
    const formatRoles = (roles) => {
        if (!roles) return '';
        if (Array.isArray(roles)) {
            return roles.map(role => 
                role.charAt(0).toUpperCase() + role.slice(1)
            ).join(' & ');
        }
        return roles.charAt(0).toUpperCase() + roles.slice(1);
    };

    return (
        <div className="top-row d-flex align-items-center">
            <header className="col-8 d-flex justify-content-center align-items-center">
                <img src={casLogo} alt="CAS Logo" className="cas-logo" />
            </header>
            <div className="col-2 user-info ms-auto d-flex align-items-center">
                {profilePic ? (
                    <img 
                        src={profilePic} 
                        alt="Profile" 
                        className="img-fluid rounded-circle"
                        style={{ 
                            width: '50px', 
                            height: '50px',
                            objectFit: 'cover',
                            border: '2px solid #e0e0e0'
                        }}
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'path/to/fallback/image.png'; // Add a fallback image
                            setProfilePic(null);
                        }}
                    />
                ) : (
                    <i className="fas fa-user-circle fa-2x me-2"></i>
                )}
                <div className="user-details">
                    <p className="user-name">{userName}</p>
                    <p className="user-role" style={{ color: '#666' }}>
                        {formatRoles(userRole)}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Header;
