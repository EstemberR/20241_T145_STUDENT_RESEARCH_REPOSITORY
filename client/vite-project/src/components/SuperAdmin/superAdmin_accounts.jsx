import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './resources/Sidebar';
import Header from './resources/Header';
import { getUserName, getToken } from './resources/Utils';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Dashboard.css';
import '../css/Dashboard2.css';
import '../css/admin_dashboard.css';
import io from 'socket.io-client';
import { useEditMode } from '../Admin/resources/EditModeContext';
import { 
  FaUserGraduate, 
  FaChalkboardTeacher, 
  FaUserShield, 
  FaUsers, 
  FaArchive
} from 'react-icons/fa';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

const SuperAdminAccounts = () => {
  const navigate = useNavigate();
  const [userName] = useState(getUserName());
  const [students, setStudents] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeTab, setActiveTab] = useState('Students');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState(''); // 'success' or 'danger'
  const [showAlert, setShowAlert] = useState(false);
  const { 
    isEditMode, 
    setIsEditMode, 
    currentEditor, 
    setCurrentEditor,
    socket 
  } = useEditMode();

  // Confirmation modal state
  const [showConfirmRestoreModal, setShowConfirmRestoreModal] = useState(false);
  const [showConfirmArchiveModal, setShowConfirmArchiveModal] = useState(false);
  const [userIdToRestore, setUserIdToRestore] = useState(null);
  const [userTypeToRestore, setUserTypeToRestore] = useState(null);
  const [userIdToArchive, setUserIdToArchive] = useState(null);
  const [userTypeToArchive, setUserTypeToArchive] = useState(null);

  const [isLoadingRestore, setIsLoadingRestore] = useState(false);
  const [isLoadingArchive, setIsLoadingArchive] = useState(false);

  // Add these chart data configurations
  const userDistributionData = {
    labels: ['Students', 'Instructors'],
    datasets: [{
      data: [
        students.filter(s => !s.archived).length,
        instructors.filter(i => !i.archived).length
      ],
      backgroundColor: ['#4CAF50', '#2196F3'],
      borderColor: ['#388E3C', '#1976D2'],
      borderWidth: 1
    }]
  };

  const accountStatusData = {
    labels: ['Active', 'Archived'],
    datasets: [{
      data: [
        students.filter(s => !s.archived).length + instructors.filter(i => !i.archived).length,
        students.filter(s => s.archived).length + instructors.filter(i => i.archived).length
      ],
      backgroundColor: ['#4CAF50', '#FF5722'],
      borderColor: ['#388E3C', '#D84315'],
      borderWidth: 1
    }]
  };

  // First, add a new state for the accounts modal
  const [showAccountsModal, setShowAccountsModal] = useState(false);

  // Add handler functions
  const handleAccountsShow = () => setShowAccountsModal(true);
  const handleAccountsClose = () => setShowAccountsModal(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      showAlertMessage('Please log in first.', 'danger');
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
        showAlertMessage('Failed to fetch accounts data', 'danger');
      }
    };

    fetchAccounts();
  }, [navigate]);

  useEffect(() => {
    if (socket) {
      console.log('Setting up socket listeners');
      
      socket.on('accountUpdate', ({ action, userType, userData }) => {
        console.log('Received account update:', { action, userType, userData });
        
        if (userType === 'students') {
          setStudents(prevStudents => {
            console.log('Updating students state:', prevStudents);
            const updatedStudents = prevStudents.filter(student => 
              student._id !== userData._id
            );
            return [...updatedStudents, userData];
          });
        } else if (userType === 'instructors') {
          setInstructors(prevInstructors => {
            console.log('Updating instructors state:', prevInstructors);
            const updatedInstructors = prevInstructors.filter(instructor => 
              instructor._id !== userData._id
            );
            return [...updatedInstructors, userData];
          });
        }
      });

      return () => {
        console.log('Cleaning up socket listeners');
        socket.off('accountUpdate');
      };
    }
  }, [socket]);

  const showAlertMessage = (message, type) => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 5000); // Hide after 5 seconds
  };

  const toggleEditMode = async () => {
    try {
      const token = getToken();
      const response = await fetch('http://localhost:8000/admin/edit-mode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          isEditing: !isEditMode,
          editor: userName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to toggle edit mode');
      }

      setIsEditMode(!isEditMode);
      socket.emit('editModeChange', {
        isEditing: !isEditMode,
        editor: userName,
      });
    } catch (error) {
      console.error('Error toggling edit mode:', error);
      showAlertMessage('Failed to toggle edit mode', 'danger');
    }
  };

  const handleViewClick = async (userId, userType) => {
    try {
      const token = getToken();
      if (!token) {
        showAlertMessage('Please log in first.', 'danger');
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
      showAlertMessage('Failed to fetch user details', 'danger');
    }
  };

  const handleArchive = async (userId, userType) => {
    setUserIdToArchive(userId);
    setUserTypeToArchive(userType);
    setShowConfirmArchiveModal(true);
  };

  const confirmArchive = async () => {
    if (userIdToArchive && userTypeToArchive) {
      setIsLoadingArchive(true);
      try {
        const token = getToken();
        const response = await fetch(`http://localhost:8000/admin/accounts/${userTypeToArchive}/${userIdToArchive}/archive`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          }
        });

        if (!response.ok) {
          throw new Error('Failed to archive user');
        }

        const updatedUser = await response.json();
        console.log('Emitting account update:', {
          action: 'archive',
          userType: userTypeToArchive,
          userData: updatedUser
        });

        socket.emit('accountUpdate', {
          action: 'archive',
          userType: userTypeToArchive,
          userData: updatedUser
        });

        showAlertMessage('User archived successfully', 'success');
      } catch (error) {
        console.error('Error archiving user:', error);
        showAlertMessage('Failed to archive user', 'danger');
      } finally {
        setShowConfirmArchiveModal(false);
        setUserIdToArchive(null);
        setUserTypeToArchive(null);
        setIsLoadingArchive(false);
      }
    }
  };

  const openRestoreModal = (userId, userType) => {
    setUserIdToRestore(userId);
    setUserTypeToRestore(userType);
    setShowConfirmRestoreModal(true);
  };

  const confirmRestore = async () => {
    if (userIdToRestore && userTypeToRestore) {
      setIsLoadingRestore(true);
      try {
        const token = getToken();
        const response = await fetch(`http://localhost:8000/admin/accounts/${userTypeToRestore}/${userIdToRestore}/restore`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          }
        });

        if (!response.ok) {
          throw new Error('Failed to restore user');
        }

        const updatedUser = await response.json();

        // Update local state first
        if (userTypeToRestore === 'students') {
          setStudents(prev => {
            const updated = prev.filter(s => s._id !== updatedUser._id);
            return [...updated, updatedUser];
          });
        } else {
          setInstructors(prev => {
            const updated = prev.filter(i => i._id !== updatedUser._id);
            return [...updated, updatedUser];
          });
        }

        // Then emit to other clients
        socket.emit('accountUpdate', {
          action: 'restore',
          userType: userTypeToRestore,
          userData: updatedUser
        });

        showAlertMessage('User restored successfully', 'success');
      } catch (error) {
        console.error('Error restoring user:', error);
        showAlertMessage('Failed to restore user', 'danger');
      } finally {
        setShowConfirmRestoreModal(false);
        setUserIdToRestore(null);
        setUserTypeToRestore(null);
        setIsLoadingRestore(false);
      }
    }
  };

  const closeModal = () => {
    setShowConfirmRestoreModal(false);
    setShowConfirmArchiveModal(false);
    setUserIdToRestore(null);
    setUserTypeToRestore(null);
    setUserIdToArchive(null);
    setUserTypeToArchive(null);
  };

  const closeViewModal = () => {
    setSelectedUser(null);
  };

  return (
    <div className="dashboard-container d-flex">
      <Sidebar />
      <div className="main-section col-10 d-flex flex-column">
        <Header userName={userName} />
        <main className="main-content p-4">
          {showAlert && (
            <div className={`alert alert-${alertType} alert-dismissible fade show`} role="alert">
              {alertMessage}
              <button type="button" className="btn-close" onClick={() => setShowAlert(false)} aria-label="Close"></button>
            </div>
          )}

          <div className="row g-4 mb-4">
            <div className="col-md-3">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body d-flex align-items-center">
                  <div className="rounded-circle p-3 bg-success bg-opacity-10 me-3">
                    <FaUsers className="text-success" />
                  </div>
                  <div>
                    <h6 className="card-title text-muted mb-0">Total Users</h6>
                    <h2 className="mt-2 mb-0">
                      {students.filter(s => !s.archived).length + 
                       instructors.filter(i => !i.archived).length}
                    </h2>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body d-flex align-items-center">
                  <div className="rounded-circle p-3 bg-success bg-opacity-10 me-3">
                    <FaUserGraduate size={30} className="text-success" />
                  </div>
                  <div>
                    <h6 className="card-title text-muted mb-0">Students</h6>
                    <h2 className="mt-2 mb-0">
                      {students.filter(s => !s.archived).length}
                    </h2>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body d-flex align-items-center">
                  <div className="rounded-circle p-3 bg-primary bg-opacity-10 me-3">
                    <FaChalkboardTeacher size={30} className="text-primary" />
                  </div>
                  <div>
                    <h6 className="card-title text-muted mb-0">Instructors</h6>
                    <h2 className="mt-2 mb-0">
                      {instructors.filter(i => !i.archived).length}
                    </h2>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body d-flex align-items-center">
                  <div className="rounded-circle p-3 bg-warning bg-opacity-10 me-3">
                    <FaArchive size={30} className="text-warning" />
                  </div>
                  <div>
                    <h6 className="card-title text-muted mb-0">Archived</h6>
                    <h2 className="mt-2 mb-0">
                      {students.filter(s => s.archived).length + 
                       instructors.filter(i => i.archived).length}
                    </h2>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row mb-4">
            <div className="col-12">
              <div className="card-body py-2">
                <button 
                  className="btn btn-success w-20 py-2"
                  onClick={handleAccountsShow}
                  style={{ fontSize: '1rem' }}
                >
                  <FaUsers className="me-2" />
                  Manage User Accounts
                </button>
              </div>
            </div>
          </div>

          <div className="row g-4 mb-4">
            <div className="col-md-6">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <h6 className="card-title mb-4">User Distribution</h6>
                  <div style={{ height: '300px' }}>
                    <Doughnut 
                      data={userDistributionData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom'
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <h6 className="card-title mb-4">Account Status Distribution</h6>
                  <div style={{ height: '300px' }}>
                    <Doughnut 
                      data={accountStatusData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom'
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Create the Accounts Management Modal */}
          {showAccountsModal && (
            <div className="modal fade show" 
              style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} 
              tabIndex="-1"
            >
              <div className="modal-dialog modal-xl modal-dialog-scrollable">
                <div className="modal-content">
                  <div className="modal-header" style={{ backgroundColor: '#4CAF50', color: 'white' }}>
                    <h5 className="modal-title">User Accounts Management</h5>
                    <button 
                      type="button" 
                      className="btn-close" 
                      onClick={handleAccountsClose}
                      style={{ filter: 'brightness(0) invert(1)' }}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <button 
                        className={`btn ${isEditMode ? 'btn-danger' : 'btn-success'}`}
                        onClick={toggleEditMode}
                        disabled={currentEditor && currentEditor !== userName}
                      >
                        {isEditMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
                      </button>
                      
                      {currentEditor && currentEditor !== userName && (
                        <div className="alert alert-warning mb-0 py-2">
                          {currentEditor} is currently editing
                        </div>
                      )}
                    </div>

                    <ul className="nav nav-tabs">
                      <li className="nav-item">
                        <button
                          className={`nav-link ${activeTab === 'Students' ? 'active' : ''}`}
                          onClick={() => setActiveTab('Students')}
                        >
                          Students
                        </button>
                      </li>
                      <li className="nav-item">
                        <button
                          className={`nav-link ${activeTab === 'Instructors' ? 'active' : ''}`}
                          onClick={() => setActiveTab('Instructors')}
                        >
                          Instructors
                        </button>
                      </li>
                      <li className="nav-item">
                        <button
                          className={`nav-link ${activeTab === 'Archived' ? 'active' : ''}`}
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
                                    disabled={!isEditMode} // Disable if not in edit mode
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
                                    disabled={!isEditMode} // Disable if not in edit mode
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
                                    onClick={() => openRestoreModal(student._id, 'students')}
                                    disabled={!isEditMode} // Disable if not in edit mode
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
                                    onClick={() => openRestoreModal(instructor._id, 'instructors')}
                                    disabled={!isEditMode} // Disable if not in edit mode
                                  >
                                    Restore
                                  </button>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={handleAccountsClose}>
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Confirmation Modal for Archive */}
          {showConfirmArchiveModal && (
            <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Confirm Archive</h5>
                    <button type="button" className="btn-close" onClick={closeModal}></button>
                  </div>
                  <div className="modal-body">
                    <p>Are you sure you want to archive this user?</p>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={closeModal}>
                      Cancel
                    </button>
                    <button type="button" className="btn btn-danger" onClick={confirmArchive} disabled={isLoadingArchive}>
                      {isLoadingArchive ? 'Archiving...' : 'Archive'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Confirmation Modal for Restore */}
          {showConfirmRestoreModal && (
            <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Confirm Restore</h5>
                    <button type="button" className="btn-close" onClick={closeModal}></button>
                  </div>
                  <div className="modal-body">
                    <p>Are you sure you want to restore this user?</p>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={closeModal}>
                      Cancel
                    </button>
                    <button type="button" className="btn btn-primary" onClick={confirmRestore} disabled={isLoadingRestore}>
                      {isLoadingRestore ? 'Restoring...' : 'Restore'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modal for viewing selected user details */}
          {selectedUser && (
            <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">
                      {selectedUser.role.toUpperCase()} DETAILS
                    </h5>
                    <button type="button" className="btn-close" onClick={closeViewModal}>
                    </button>
                  </div>
                  <div className="modal-body">
                    <p><strong>User ID:</strong> {selectedUser.studentId || selectedUser.uid}</p>
                    <p><strong>Name:</strong> {selectedUser.name}</p>
                    <p><strong>Role:</strong> {selectedUser.role}</p>
                    <p><strong>Email:</strong> {selectedUser.email}</p>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={closeViewModal}>
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

export default SuperAdminAccounts;
