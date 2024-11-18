import React from 'react';
import casLogo from "../../../assets/cas-logo.jpg";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../css/Dashboard.css';

const Header = ({ userName, userRole }) => {
  // Format roles for display
  const formatRoles = (roles) => {
    if (!roles) return 'Instructor';
    if (Array.isArray(roles)) {
      return roles.map(role => 
        role.charAt(0).toUpperCase() + role.slice(1)
      ).join(' • ');
    }
    return roles.charAt(0).toUpperCase() + roles.slice(1);
  };

  return (
    <div className="top-row d-flex align-items-center">
      <header className="col-8 d-flex justify-content-center align-items-center">
        <img src={casLogo} alt="CAS Logo" className="cas-logo" />
      </header>
      <div className="col-2 user-info ms-auto d-flex align-items-center">
        <img
          src={'https://via.placeholder.com/150'}
          alt="Profile"
          className="img-fluid rounded-circle"
          style={{ width: '50px', height: '50px' }}
        />
        <div className="user-details">
          <p className="user-name">{userName}</p>
          <p className="user-role">{formatRoles(userRole)}</p>
        </div>
      </div>
    </div>
  );
};

export default Header;
