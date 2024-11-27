import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './resources/Sidebar';
import Header from './resources/Header';
import { getUserName, getToken } from './resources/Utils';
import { FaUserPlus, FaUserMinus, FaSpinner } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Dashboard.css';
import '../css/admin_dashboard.css';

const SuperAdminManageAdmins = () => {
  const navigate = useNavigate();
  const [userName] = useState(getUserName());
  const [Instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    admins: 0,
    regular: 0
  });

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
      
      // Update stats
      const adminCount = activeInstructors.filter(instructor => instructor.isAdmin).length;
      setStats({
        total: activeInstructors.length,
        admins: adminCount,
        regular: activeInstructors.length - adminCount
      });

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
          <h4 className="mb-4">MANAGE ADMINS</h4>

          {/* Stats Cards */}
          <div className="row mb-4">
            <div className="col-md-4">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <h6 className="text-muted">Total Instructors</h6>
                  <h2 className="mb-0 text-primary">{stats.total}</h2>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <h6 className="text-muted">Admin Instructors</h6>
                  <h2 className="mb-0 text-success">{stats.admins}</h2>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <h6 className="text-muted">Regular Instructors</h6>
                  <h2 className="mb-0 text-info">{stats.regular}</h2>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

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
                        <th>Department</th>
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
                            <td>{instructor.department}</td>
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

export default SuperAdminManageAdmins; 