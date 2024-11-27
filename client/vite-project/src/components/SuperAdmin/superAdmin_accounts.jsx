import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './resources/Sidebar';
import Header from './resources/Header';
import { getUserName, getToken } from './resources/Utils';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Dashboard.css';
import '../css/admin_dashboard.css';

const superAdminAccounts = () => {
  const navigate = useNavigate();
  const [userName] = useState(getUserName());
  const [students, setStudents] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeTab, setActiveTab] = useState('Students');

  useEffect(() => {
    const token = getToken();
    if (!token) {
      alert('Please log in first.');
      localStorage.removeItem('userName');
      localStorage.removeItem('token');
      navigate('/');
      return;
    }

    const fetchAccounts = async () => {
      try {
        const responseStudents = await fetch('http://localhost:8000/admin/accounts/students', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        const responseInstructors = await fetch('http://localhost:8000/admin/accounts/instructors', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!responseStudents.ok || !responseInstructors.ok) throw new Error('Failed to fetch accounts data');
        
        const studentsData = await responseStudents.json();
        const instructorsData = await responseInstructors.json();
        
        setStudents(studentsData);
        setInstructors(instructorsData);
      } catch (error) {
        console.error('Error fetching accounts:', error);
        alert('Failed to fetch accounts data');
      }
    };

    fetchAccounts();
  }, [navigate]);

  const handleViewClick = async (userId, userType) => {
    try {
      const token = getToken();
      if (!token) {
        alert('Please log in first.');
        localStorage.removeItem('userName');
        localStorage.removeItem('token');
        navigate('/');
        return;
      }

      const response = await fetch(`http://localhost:8000/admin/accounts/${userType}/${userId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user details');
      }

      const userData = await response.json();
      setSelectedUser(userData);
    } catch (error) {
      console.error('Error fetching user details:', error);
      alert('Failed to fetch user details');
    }
  };

  const handleArchive = async (userId, userType) => {
    try {
      const token = getToken();
      const response = await fetch(`http://localhost:8000/admin/accounts/${userType}/${userId}/archive`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      });

      if (!response.ok) {
        throw new Error('Failed to archive user');
      }

      // Refresh the accounts list
      const updatedResponse = await fetch(`http://localhost:8000/admin/accounts/${userType}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const updatedData = await updatedResponse.json();
      if (userType === 'students') {
        setStudents(updatedData);
      } else {
        setInstructors(updatedData);
      }

      alert('User archived successfully');
    } catch (error) {
      console.error('Error archiving user:', error);
      alert('Failed to archive user');
    }
  };

  const handleRestore = async (userId, userType) => {
    try {
      const token = getToken();
      const response = await fetch(`http://localhost:8000/admin/accounts/${userType}/${userId}/restore`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      });

      if (!response.ok) {
        throw new Error('Failed to restore user');
      }

      // Refresh the accounts list
      const updatedResponse = await fetch(`http://localhost:8000/admin/accounts/${userType}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const updatedData = await updatedResponse.json();
      if (userType === 'students') {
        setStudents(updatedData);
      } else {
        setInstructors(updatedData);
      }

      alert('User restored successfully');
    } catch (error) {
      console.error('Error restoring user:', error);
      alert('Failed to restore user');
    }
  };

  const closeModal = () => setSelectedUser(null);

  return (
    <div className="dashboard-container d-flex">
      <Sidebar />
      <div className="main-section col-10 d-flex flex-column">
        <Header userName={userName} />
        <main className="main-content">
            <h4 className="my-3">USER ACCOUNTS MANAGEMENT</h4>
            <ul className="nav nav-tabs">
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'Students' ? 'active' : ''} x`}
                  onClick={() => setActiveTab('Students')}
                >
                  Students
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'Instructors' ? 'active' : ''} x`}
                  onClick={() => setActiveTab('Instructors')}
                >
                  Instructors
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'Archived' ? 'active' : ''} x`}
                  onClick={() => setActiveTab('Archived')}
                >
                  Archived
                </button>
              </li>
            </ul>

            {activeTab === 'Students' && (
              <table className="table table-striped table-bordered mt-3">
                <thead className="table-primary">
                  <tr>
                    <th>User ID</th>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students
                    .filter(student => !student.archived)
                    .map((student) => (
                      <tr key={student._id}>
                        <td>{student.studentId}</td>
                        <td>{student.name}</td>
                        <td>{student.role}</td>
                        <td>{student.email}</td>
                        <td>
                          <span className="badge bg-success">
                            Active
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-success btn-sm me-2"
                            onClick={() => handleViewClick(student._id, 'students')}
                          >
                            View
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleArchive(student._id, 'students')}
                          >
                            Archive
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}

            {activeTab === 'Instructors' && (
              <table className="table table-striped table-bordered mt-3">
                <thead className="table-primary">
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {instructors
                    .filter(instructor => !instructor.archived)
                    .map((instructor) => (
                      <tr key={instructor._id}>
                        <td>{instructor.uid}</td>
                        <td>{instructor.name}</td>
                        <td>{instructor.role}</td>
                        <td>{instructor.email}</td>
                        <td>
                          <span className="badge bg-success">
                            Active
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-success btn-sm me-2"
                            onClick={() => handleViewClick(instructor._id, 'instructors')}
                          >
                            View
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleArchive(instructor._id, 'instructors')}
                          >
                            Archive
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}

            {activeTab === 'Archived' && (
              <table className="table table-striped table-bordered mt-3">
                <thead className="table-primary">
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students
                    .filter(student => student.archived)
                    .map(student => (
                      <tr key={student._id}>
                        <td>{student.studentId}</td>
                        <td>{student.name}</td>
                        <td>{student.role}</td>
                        <td>{student.email}</td>
                        <td>
                          <span className="badge bg-danger">
                            Archived
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-success btn-sm me-2"
                            onClick={() => handleViewClick(student._id, 'students')}
                          >
                            View
                          </button>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleRestore(student._id, 'students')}
                          >
                            Restore
                          </button>
                        </td>
                      </tr>
                    ))}
                  {instructors
                    .filter(instructor => instructor.archived)
                    .map(instructor => (
                      <tr key={instructor._id}>
                        <td>{instructor.uid}</td>
                        <td>{instructor.name}</td>
                        <td>{instructor.role}</td>
                        <td>{instructor.email}</td>
                        <td>
                          <span className="badge bg-danger">
                            Archived
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-success btn-sm me-2"
                            onClick={() => handleViewClick(instructor._id, 'instructors')}
                          >
                            View
                          </button>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleRestore(instructor._id, 'instructors')}
                          >
                            Restore
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}

          {/* Modal for viewing selected user details */}
          {selectedUser && (
            <div className="modal" style={{ display: 'block' }}>
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">
                      {selectedUser.role.toUpperCase()} DETAILS
                    </h5>
                    <button type="button" className="close" onClick={closeModal}>
                      &times;
                    </button>
                  </div>
                  <div className="modal-body">
                    <p><strong>User ID:</strong> {selectedUser.studentId || selectedUser.uid}</p>
                    <p><strong>Name:</strong> {selectedUser.name}</p>
                    <p><strong>Role:</strong> {selectedUser.role}</p>
                    <p><strong>Email:</strong> {selectedUser.email}</p>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={closeModal}>
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default superAdminAccounts;
