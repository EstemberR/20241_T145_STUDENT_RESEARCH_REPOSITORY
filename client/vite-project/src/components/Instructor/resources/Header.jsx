import React from 'react';
import casLogo from "../../../assets/cas-logo.jpg";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../css/Dashboard.css';

const Header = ({ userName }) => (
  <div className="top-row d-flex align-items-center">
    <header className="col-8 d-flex justify-content-center align-items-center">
      <img src={casLogo} alt="CAS Logo" className="cas-logo" />
    </header>
    <div className="col-2 user-info ms-auto d-flex align-items-center">
      <img
        src={'https://via.placeholder.com/150'} // Static image or user profile picture
        alt="Profile"
        className="img-fluid rounded-circle"
        style={{ width: '50px', height: '50px' }}
      />
      <div className="user-details">
        <p className="user-name">{userName}</p>
        <p className="user-role">Instructor</p>
      </div>
    </div>
  </div>
);

export default Header;
