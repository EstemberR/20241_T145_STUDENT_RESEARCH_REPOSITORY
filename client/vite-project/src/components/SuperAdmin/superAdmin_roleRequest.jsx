import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './resources/Sidebar';
import Header from './resources/Header';
import { getUserName, getToken } from './resources/Utils';
import { FaUserPlus, FaUserMinus, FaSpinner } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Dashboard.css';
import '../css/admin_dashboard.css';
import axios from 'axios';
import '../css/adminCreation.css';
import { Modal } from 'react-bootstrap';

const SuperAdminManageAdmins = () => {
  const navigate = useNavigate();
  const [userName] = useState(getUserName());
  const [Instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);


     
const CreateAdminForm = ({ show, onHide, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        'http://localhost:8000/admin/create-admin', 
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`
          }
        }
      );

      if (response.data.success) {
        setFormData({ name: '', email: '', password: '' });
        alert('Admin created successfully!');
        if (onSuccess) onSuccess();
        onHide();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      backdrop="static"
      keyboard={false}
      className="admin-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>Create New Admin Account</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <div className="alert alert-danger">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Username:</label>
            <input
              type="text"
              className="form-control"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Email:</label>
            <input
              type="email"
              className="form-control"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Password:</label>
            <input
              type="password"
              className="form-control"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button 
              type="button" 
              className="btn create-admin-btn"
              onClick={onHide}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Admin'}
            </button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
};
  useEffect(() => {
    const token = getToken();
    if (!token) {
      alert('Please log in first.');
      navigate('/');
      return;
    }
    fetchInstructors();
  }, [navigate]);

  const fetchInstructors = async () => {
    try {
      setLoading(true);
      const token = getToken();
      console.log('Fetching with token:', token);
      
      const response = await fetch('http://localhost:8000/admin/accounts/instructors', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      const data = await response.json();
      console.log('Fetched data:', data);
      
      const activeInstructors = data.filter(instructor => !instructor.archived);
      setInstructors(activeInstructors);

      setError(null);
    } catch (error) {
      console.error('Error fetching instructors:', error);
      setError(`Failed to fetch instructors: ${error.message}`);
      setInstructors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminStatusUpdate = async (instructorId, makeAdmin) => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await fetch(`http://localhost:8000/superadmin/instructors/${instructorId}/admin-status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isAdmin: makeAdmin })
      });

      if (!response.ok) throw new Error('Failed to update admin status');

       // Update stats based on the actual data structure
      await fetchInstructors();
    } catch (err) {
      setError('Failed to update admin status');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="dashboard-container d-flex">
      <Sidebar />
      <div className="main-section col-10 d-flex flex-column">
        <Header userName={userName} />
        <main className="main-content p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4>MANAGE ADMINS</h4>
            <button 
              className="btn btn-green"
              onClick={() => setShowCreateForm(true)}
            >
              <FaUserPlus className="me-2" />
              Create New Admin
            </button>
          </div>

          {/* Create Admin Modal */}
          <CreateAdminForm 
            show={showCreateForm}
            onHide={() => setShowCreateForm(false)}
            onSuccess={() => {
              setShowCreateForm(false);
              fetchInstructors();
            }}
          />
          {/* Error Alert */}
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {/* Loading Spinner and Table */}
          {loading ? (
            <div className="text-center py-5">
              <FaSpinner className="spinner-border" />
              <p className="mt-2">Loading instructors...</p>
            </div>
          ) : (
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Admin Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Instructors.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center py-4">
                            No instructors found
                          </td>
                        </tr>
                      ) : (
                        Instructors.map((instructor) => (
                          <tr key={instructor._id}>
                            <td>{instructor.name}</td>
                            <td>{instructor.email}</td>
                            <td>
                              <span className={`badge ${instructor.isAdmin ? 'bg-success' : 'bg-secondary'}`}>
                                {instructor.isAdmin ? 'Admin' : 'Regular'}
                              </span>
                            </td>
                            <td>
                              {instructor.isAdmin ? (
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() => handleAdminStatusUpdate(instructor._id, false)}
                                  title="Remove Admin"
                                >
                                  <FaUserMinus />
                                </button>
                              ) : (
                                <button
                                  className="btn btn-success btn-sm"
                                  onClick={() => handleAdminStatusUpdate(instructor._id, true)}
                                  title="Make Admin"
                                >
                                  <FaUserPlus />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

const CreateAdminForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''  // Added password field
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        'http://localhost:8000/admin/create-admin', 
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`
          }
        }
      );

      if (response.data.success) {
        setFormData({ name: '', email: '', password: '' });
        alert('Admin created successfully!');
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-admin-form">
      <h5 className="mb-4">Create New Admin Account</h5>
      {error && <div className="alert alert-danger">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Username:</label>
          <input
            type="text"
            className="form-control"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Email:</label>
          <input
            type="email"
            className="form-control"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Password:</label>
          <input
            type="password"
            className="form-control"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
          />
        </div>

        <button 
          type="submit" 
          className="btn btn-secondary"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Admin'}
        </button>
      </form>
    </div>
  );
};

export default SuperAdminManageAdmins; 