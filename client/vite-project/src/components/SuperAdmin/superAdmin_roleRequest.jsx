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
import LoadingWithNetworkCheck from '../common/LoadingWithNetworkCheck';

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [updatedPermissions, setUpdatedPermissions] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });

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

  const showAlert = (message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => {
      setAlert({ show: false, message: '', type: '' });
    }, 3000);
  };

  const handleAdminStatusUpdate = async (adminId, makeActive) => {
    try {
      setIsProcessing(true);
      const response = await fetch(`http://localhost:8000/admin/admins/${adminId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: makeActive })
      });

      if (!response.ok) throw new Error('Failed to update admin status');
      
      await fetchAdmins();
      showAlert(`Admin ${makeActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error updating admin status:', error);
      showAlert('Failed to update admin status', 'danger');
    } finally {
      setIsProcessing(false);
      setShowConfirmModal(false);
    }
  };

  const ConfirmationModal = ({ show, onHide, message, onConfirm, isProcessing }) => (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Confirm Action</Modal.Title>
      </Modal.Header>
      <Modal.Body>{message}</Modal.Body>
      <Modal.Footer>
        <button 
          className="btn btn-secondary" 
          onClick={onHide} 
          disabled={isProcessing}
        >
          Cancel
        </button>
        <button 
          className="btn btn-primary" 
          onClick={onConfirm} 
          disabled={isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Confirm'}
        </button>
      </Modal.Footer>
    </Modal>
  );

  const EditPermissionsModal = ({ show, onHide, admin }) => {
    const [permissions, setPermissions] = useState(admin?.permissions || []);
    const [saving, setSaving] = useState(false);

    const handlePermissionChange = (permissionId) => {
      setPermissions(prev => 
        prev.includes(permissionId) 
          ? prev.filter(p => p !== permissionId)
          : [...prev, permissionId]
      );
    };

    const handleSubmit = async () => {
      setSaving(true);
      try {
        const response = await fetch(`http://localhost:8000/admin/admins/${admin._id}/permissions`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ permissions })
        });

        if (!response.ok) throw new Error('Failed to update permissions');
        
        await fetchAdmins();
        showAlert('Permissions updated successfully');
        onHide();
      } catch (error) {
        console.error('Error updating permissions:', error);
        showAlert('Failed to update permissions', 'danger');
      } finally {
        setSaving(false);
      }
    };

    return (
      <Modal show={show} onHide={onHide} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Admin Permissions</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Editing permissions for: <strong>{admin?.name}</strong></p>
          <div className="permissions-grid">
            {Object.values(PERMISSIONS).map(permission => (
              <div key={permission.id} className="permission-item mb-2 p-2 border rounded">
                <div className="d-flex align-items-center">
                  <input
                    type="checkbox"
                    className="form-check-input me-2"
                    checked={permissions.includes(permission.id)}
                    onChange={() => handlePermissionChange(permission.id)}
                    disabled={saving}
                  />
                  <div>
                    <label className="form-check-label fw-bold">
                      {permission.label}
                    </label>
                    <p className="text-muted small mb-0">{permission.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button 
            className="btn btn-secondary" 
            onClick={onHide} 
            disabled={saving}
          >
            Cancel
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleSubmit} 
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </Modal.Footer>
      </Modal>
    );
  };

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

          {alert.show && (
            <div 
              className={`alert alert-${alert.type} alert-dismissible fade show`} 
              role="alert"
            >
              {alert.message}
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setAlert({ show: false, message: '', type: '' })}
              ></button>
            </div>
          )}

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
                              <div className="d-flex gap-2">
                                <button
                                  className={`btn btn-sm ${admin.isActive ? 'btn-danger' : 'btn-success'}`}
                                  onClick={() => {
                                    setSelectedAdmin(admin);
                                    setConfirmAction(() => () => handleAdminStatusUpdate(admin._id, !admin.isActive));
                                    setShowConfirmModal(true);
                                  }}
                                  disabled={isProcessing}
                                  title={admin.isActive ? 'Deactivate Admin' : 'Activate Admin'}
                                >
                                  {admin.isActive ? <FaUserMinus /> : <FaUserPlus />}
                                </button>
                                <button
                                  className="btn btn-sm btn-primary"
                                  onClick={() => {
                                    setSelectedAdmin(admin);
                                    setShowPermissionModal(true);
                                  }}
                                  disabled={isProcessing}
                                  title="Edit Permissions"
                                >
                                  <i className="fas fa-key"></i>
                                </button>
                              </div>
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

          <ConfirmationModal
            show={showConfirmModal}
            onHide={() => !isProcessing && setShowConfirmModal(false)}
            message={`Are you sure you want to ${selectedAdmin?.isActive ? 'deactivate' : 'activate'} this admin account?`}
            onConfirm={confirmAction}
            isProcessing={isProcessing}
          />

          <EditPermissionsModal
            show={showPermissionModal}
            onHide={() => setShowPermissionModal(false)}
            admin={selectedAdmin}
          />
        </main>
      </div>
    </div>
  );
};

export default SuperAdminManageAdmins; 