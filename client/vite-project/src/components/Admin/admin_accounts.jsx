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
import { useEditMode } from './resources/EditModeContext';
import DataTable from 'react-data-table-component';
import { FaEye, FaArchive, FaUndo } from 'react-icons/fa';

const AdminAccounts = () => {
  const navigate = useNavigate();
  const [userName] = useState(getUserName());
  const [students, setStudents] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeTab, setActiveTab] = useState('Students');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState(''); 
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

  const columns = {
    active: [
      {
        name: 'ID',
        selector: row => row.studentId || row.uid,
        sortable: true,
      },
      {
        name: 'Name',
        selector: row => row.name,
        sortable: true,
      },
      {
        name: 'Role',
        selector: row => row.role,
        sortable: true,
      },
      {
        name: 'Email',
        selector: row => row.email,
        sortable: true,
      },
      {
        name: 'Status',
        cell: row => (
          <span className="badge bg-success">
            Active
          </span>
        ),
        sortable: true,
      },
      {
        name: 'Actions',
        cell: row => (
          <div className="d-flex gap-2 flex-wrap justify-content-start" style={{ minWidth: '200px' }}>
            <button
              className="btn btn-sm btn-success d-flex align-items-center"
              onClick={() => handleViewClick(row._id, row.role === 'student' ? 'students' : 'instructors')}
              style={{ width: '80px' }}
            >
              <FaEye className="me-1" /> View
            </button>
            <button
              className="btn btn-sm btn-danger d-flex align-items-center"
              onClick={() => handleArchive(row._id, row.role === 'student' ? 'students' : 'instructors')}
              disabled={!isEditMode}
              style={{ width: '100px' }}
            >
              <FaArchive className="me-1" /> Archive
            </button>
          </div>
        ),
        width: '250px'
      }
    ],
    archived: [
      {
        name: 'ID',
        selector: row => row.studentId || row.uid,
        sortable: true,
      },
      {
        name: 'Name',
        selector: row => row.name,
        sortable: true,
      },
      {
        name: 'Role',
        selector: row => row.role,
        sortable: true,
      },
      {
        name: 'Email',
        selector: row => row.email,
        sortable: true,
      },
      {
        name: 'Status',
        cell: row => (
          <span className="badge bg-danger">
            Archived
          </span>
        ),
        sortable: true,
      },
      {
        name: 'Actions',
        cell: row => (
          <div className="d-flex gap-2 flex-wrap justify-content-start" style={{ minWidth: '200px' }}>
            <button
              className="btn btn-sm btn-success d-flex align-items-center"
              onClick={() => handleViewClick(row._id, row.role === 'student' ? 'students' : 'instructors')}
              style={{ width: '80px' }}
            >
              <FaEye className="me-1" /> View
            </button>
            <button
              className="btn btn-sm btn-primary d-flex align-items-center"
              onClick={() => openRestoreModal(row._id, row.role === 'student' ? 'students' : 'instructors')}
              disabled={!isEditMode}
              style={{ width: '90px' }}
            >
              <FaUndo className="me-1" /> Restore
            </button>
          </div>
        ),
        width: '250px'
      }
    ]
  };

  const customStyles = {
    rows: {
      style: {
        minHeight: '72px',
        '&:hover': {
          backgroundColor: '#f8f9fa',
        }
      }
    },
    headCells: {
      style: {
        paddingLeft: '16px',
        paddingRight: '16px',
        backgroundColor: '#f8f9fa',
        fontWeight: 'bold'
      },
    },
    cells: {
      style: {
        paddingLeft: '16px',
        paddingRight: '16px',
      },
    },
  };

  const getFilteredData = () => {
    switch (activeTab) {
      case 'Students':
        return students.filter(student => !student.archived);
      case 'Instructors':
        return instructors.filter(instructor => !instructor.archived);
      case 'Archived':
        return [
          ...students.filter(student => student.archived),
          ...instructors.filter(instructor => instructor.archived)
        ];
      default:
        return [];
    }
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
          <h4 className="my-3">USER ACCOUNTS MANAGEMENT</h4>
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
          <ul className="nav nav-tabs mb-4">
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

          <DataTable
            columns={activeTab === 'Archived' ? columns.archived : columns.active}
            data={getFilteredData()}
            pagination
            paginationPerPage={10}
            paginationRowsPerPageOptions={[10, 20, 30, 50]}
            highlightOnHover
            pointerOnHover
            responsive
            striped
            customStyles={customStyles}
          />

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

export default AdminAccounts;
