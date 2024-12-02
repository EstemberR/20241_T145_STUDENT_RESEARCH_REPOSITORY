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

const PERMISSIONS = {
    MANAGE_ACCOUNTS: { 
        id: 'manage_accounts', 
        label: 'Manage Accounts',
        description: 'Can view and manage student/instructor accounts'
    },
    MANAGE_REPOSITORY: { 
        id: 'manage_repository', 
        label: 'Manage Repository',
        description: 'Can manage research submissions and repository content'
    },
    VIEW_USER_ACTIVITY: { 
        id: 'view_user_activity', 
        label: 'View User Activity',
        description: 'Can access and monitor user activities'
    },
    GENERATE_REPORTS: { 
        id: 'generate_reports', 
        label: 'Generate Reports',
        description: 'Can generate and view system reports'
    }
};

const SuperAdminManageAdmins = () => {
  const navigate = useNavigate();
  const [userName] = useState(getUserName());
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);


     
const CreateAdminForm = ({ show, onHide, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    permissions: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePermissionChange = (permissionId) => {
    console.log('Changing permission:', permissionId);
    setFormData(prev => {
      const newPermissions = prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId];
      console.log('New permissions:', newPermissions);
      return { ...prev, permissions: newPermissions };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const submitData = {
      ...formData,
      permissions: formData.permissions
    };

    console.log('Submitting data:', submitData);

    try {
      const response = await axios.post(
        'http://localhost:8000/admin/create-admin', 
        submitData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`
          }
        }
      );

      if (response.data.success) {
        setFormData({ name: '', email: '', password: '', permissions: [] });
        alert('Admin created successfully!');
        if (onSuccess) onSuccess();
        onHide();
      }
    } catch (err) {
      console.error('Error creating admin:', err);
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
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Email:</label>
            <input
              type="email"
              className="form-control"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Password:</label>
            <input
              type="password"
              className="form-control"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Admin Permissions:</label>
            <div className="permissions-grid">
                {Object.values(PERMISSIONS).map(permission => (
                    <div key={permission.id} className="permission-item mb-2 p-2 border rounded">
                        <div className="d-flex align-items-center">
                            <input
                                type="checkbox"
                                className="form-check-input me-2"
                                id={permission.id}
                                checked={formData.permissions.includes(permission.id)}
                                onChange={() => handlePermissionChange(permission.id)}
                            />
                            <div>
                                <label className="form-check-label fw-bold" htmlFor={permission.id}>
                                    {permission.label}
                                </label>
                                <p className="text-muted small mb-0">{permission.description}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
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
    fetchAdmins();
  }, [navigate]);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      const response = await fetch('http://localhost:8000/admin/admins', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const data = await response.json();
      setAdmins(data.admins);
      setError(null);
    } catch (error) {
      console.error('Error fetching admins:', error);
      setError(`Failed to fetch admins: ${error.message}`);
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminStatusUpdate = async (adminId, makeActive) => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await fetch(`http://localhost:8000/superadmin/admins/${adminId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: makeActive })
      });

      if (!response.ok) throw new Error('Failed to update admin status');

       // Update stats based on the actual data structure
      await fetchAdmins();
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

          <CreateAdminForm 
            show={showCreateForm}
            onHide={() => setShowCreateForm(false)}
            onSuccess={() => {
              setShowCreateForm(false);
              fetchAdmins();
            }}
          />

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-5">
              <FaSpinner className="spinner-border" />
              <p className="mt-2">Loading admins...</p>
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
                        <th>Permissions</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {admins.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center py-4">
                            No admin accounts found
                          </td>
                        </tr>
                      ) : (
                        admins.map((admin) => (
                          <tr key={admin._id}>
                            <td>{admin.name}</td>
                            <td>{admin.email}</td>
                            <td>
                              {admin.permissions?.length > 0 ? (
                                <div className="permissions-badges">
                                  {admin.permissions.map((permission, index) => {
                                    const permissionInfo = Object.values(PERMISSIONS).find(p => p.id === permission);
                                    return (
                                      <span key={index} className="badge bg-info me-1">
                                        {permissionInfo ? permissionInfo.label : permission}
                                      </span>
                                    );
                                  })}
                                </div>
                              ) : (
                                <span className="text-muted">No permissions</span>
                              )}
                            </td>
                            <td>
                              <span className={`badge ${admin.isActive ? 'bg-success' : 'bg-danger'}`}>
                                {admin.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td>
                              <button
                                className={`btn btn-sm ${admin.isActive ? 'btn-danger' : 'btn-success'}`}
                                onClick={() => handleAdminStatusUpdate(admin._id, !admin.isActive)}
                                title={admin.isActive ? 'Deactivate Admin' : 'Activate Admin'}
                              >
                                {admin.isActive ? <FaUserMinus /> : <FaUserPlus />}
                              </button>
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

export default SuperAdminManageAdmins; 