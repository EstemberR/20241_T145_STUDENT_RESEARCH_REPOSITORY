import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './resources/Sidebar';
import Header from './resources/Header';
import { getUserName, getToken } from './resources/Utils';
import LoadingWithNetworkCheck from '../common/LoadingWithNetworkCheck';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Dashboard.css';
import '../css/Dashboard2.css';
import '../css/admin_dashboard.css';

const CreateAdmin = () => {
  const navigate = useNavigate();
  const [userName] = useState(getUserName());
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [responseMessage, setResponseMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getToken();
        if (!token) {
          alert('Please log in first.');
          localStorage.removeItem('userName');
          localStorage.removeItem('token');
          navigate('/');
          return;
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="dashboard-container d-flex">
        <Sidebar />
        <div className="main-section col-10 d-flex flex-column">
          <Header userName={userName} />
          <LoadingWithNetworkCheck />
        </div>
      </div>
    );
  }

  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent the default form submission

    const token = getToken(); // Get the JWT token

    try {
      const response = await fetch('http://localhost:8000/admin/create-initial-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          email,
          password
        })
      });

      const data = await response.json();
      setResponseMessage(data.message); // Set the response message

      if (data.success) {
        // Optionally, reset the form fields
        setName('');
        setEmail('');
        setPassword('');
      }

    } catch (error) {
      console.error('Error:', error);
      setResponseMessage('Error creating admin account');
    }
  };

  return (
    <div className="dashboard-container d-flex">
      <Sidebar />
      <div className="main-section col-10 d-flex flex-column">
        <Header userName={userName} />

        <main className="main-content">
          <form id="createAdminForm" onSubmit={handleSubmit}>
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            /><br /><br />

            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            /><br /><br />

            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            /><br /><br />

            <button type="submit">Create Admin</button>
          </form>

          {responseMessage && <div>{responseMessage}</div>} {/* Display response message */}
        </main>
      </div>
    </div>
  );
};

export default CreateAdmin;
