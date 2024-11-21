import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Admin/resources/Header';
import Sidebar from '../Admin/resources/Sidebar';

const SuperAdminDashboard = () => {
    const [admins, setAdmins] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [newAdmin, setNewAdmin] = useState({
        name: '',
        email: '',
        password: ''
    });
    const navigate = useNavigate();

    // Fetch all admins
    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
       
        try {
            const response = await fetch('http://localhost:8000/api/superadmin/admins', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setAdmins(data);
            }
        } catch (error) {
            console.error('Error fetching admins:', error);
        } finally {
          
        }
    };

    // Add new admin
    const handleAddAdmin = async (e) => {
        e.preventDefault();
      
        try {
            const response = await fetch('http://localhost:8000/api/superadmin/add-admin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(newAdmin)
            });

            if (response.ok) {
                alert('Admin added successfully');
                setNewAdmin({ name: '', email: '', password: '' });
                fetchAdmins();
            } else {
                const data = await response.json();
                alert(data.message || 'Error adding admin');
            }
        } catch (error) {
            console.error('Error adding admin:', error);
            alert('Error adding admin');
        } 
    };

    return (
        <>
            {isLoading && <LoadingScreen />}
            <div className="d-flex">
                <Sidebar />
                <div className="w-100">
                    <Header />
                    <div className="dashboard-container">
                        <div className="container-fluid py-4">
                            <h1 className="h3 mb-4 text-gray-800">Super Admin Dashboard</h1>
                            
                            {/* Add Admin Form */}
                            <div className="card shadow mb-4">
                                <div className="card-header py-3">
                                    <h2 className="m-0 font-weight-bold text-success">Add New Admin</h2>
                                </div>
                                <div className="card-body">
                                    <form onSubmit={handleAddAdmin} className="row g-3">
                                        <div className="col-md-4">
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Name"
                                                value={newAdmin.name}
                                                onChange={(e) => setNewAdmin({...newAdmin, name: e.target.value})}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-4">
                                            <input
                                                type="email"
                                                className="form-control"
                                                placeholder="Email"
                                                value={newAdmin.email}
                                                onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-4">
                                            <input
                                                type="password"
                                                className="form-control"
                                                placeholder="Password"
                                                value={newAdmin.password}
                                                onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})}
                                                required
                                            />
                                        </div>
                                        <div className="col-12">
                                            <button type="submit" className="btn btn-success">
                                                <i className="fas fa-plus-circle me-2"></i>Add Admin
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>

                            {/* Admin List */}
                            <div className="card shadow mb-4">
                                <div className="card-header py-3">
                                    <h2 className="m-0 font-weight-bold text-success">Current Admins</h2>
                                </div>
                                <div className="card-body">
                                    <div className="table-responsive">
                                        <table className="table table-bordered table-hover">
                                            <thead className="table-success">
                                                <tr>
                                                    <th>Name</th>
                                                    <th>Email</th>
                                                    <th>Created At</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {admins.map(admin => (
                                                    <tr key={admin._id}>
                                                        <td>{admin.name}</td>
                                                        <td>{admin.email}</td>
                                                        <td>{new Date(admin.createdAt).toLocaleDateString()}</td>
                                                        <td>
                                                            <button 
                                                                className="btn btn-primary btn-sm me-2"
                                                                onClick={() => handleEditAdmin(admin._id)}
                                                            >
                                                                <i className="fas fa-edit me-1"></i>Edit
                                                            </button>
                                                            <button 
                                                                className="btn btn-danger btn-sm"
                                                                onClick={() => handleDeleteAdmin(admin._id)}
                                                            >
                                                                <i className="fas fa-trash-alt me-1"></i>Delete
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SuperAdminDashboard; 