import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './resources/Sidebar';
import Header from './resources/Header';
import { getUserName, getToken } from './resources/Utils';
import Select from 'react-select';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Dashboard.css';
import '../css/Dashboard2.css';
import { Alert } from 'react-bootstrap';
import { FaUserTie, FaEnvelope, FaUsers, FaChalkboardTeacher, FaBookReader } from 'react-icons/fa';

const ManageMember = () => {
  const navigate = useNavigate();
  const [userName] = useState(getUserName());
  const [students, setStudents] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [teamStatus, setTeamStatus] = useState(null);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingSubmission, setPendingSubmission] = useState(null);
  const [isLeader, setIsLeader] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);

  // Helper function for showing alerts
  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: '' }), 5000);
  };

  useEffect(() => {
    const token = getToken();
    if (!token) {
      showAlert('Please log in first.', 'danger');
      localStorage.removeItem('userName');
      localStorage.removeItem('token');
      navigate('/');
    }
    checkTeamStatus();
    fetchStudentsAndInstructors();
  }, [navigate]);

  useEffect(() => {
    // Only fetch students and instructors if the student needs to create a team
    if (!loading && (!teamStatus?.hasApprovedTeam && !teamStatus?.hasPendingRequest)) {
      fetchStudentsAndInstructors();
    }
  }, [loading, teamStatus]);

  useEffect(() => {
    if (teamStatus?.teamMembers?.length > 0) {
      const isUserLeader = teamStatus.teamMembers[0].toLowerCase() === userName.toLowerCase();
      setIsLeader(isUserLeader);
    }
  }, [teamStatus, userName]);

  const checkTeamStatus = async () => {
    try {
      const token = getToken();
      const response = await fetch('http://localhost:8000/student/check-team-status', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch team status');
      }

      const data = await response.json();
      console.log('Team status data:', data);
      setTeamStatus(data);
      setLoading(false);
    } catch (error) {
      console.error('Error checking team status:', error);
      setLoading(false);
    }
  };

  const fetchStudentsAndInstructors = async () => {
    setLoadingOptions(true);
    try {
      const token = getToken();
      const [studentsRes, instructorsRes] = await Promise.all([
        fetch('http://localhost:8000/student/available-students', {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch('http://localhost:8000/student/all-instructors', {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      if (!studentsRes.ok || !instructorsRes.ok) {
        throw new Error('Failed to fetch students or instructors');
      }

      const studentsData = await studentsRes.json();
      const instructorsData = await instructorsRes.json();

      setStudents(studentsData.map(student => ({
        value: student._id,
        label: `${student.name} (${student.studentId})`
      })));

      setInstructors(instructorsData.map(instructor => ({
        value: instructor._id,
        label: instructor.name
      })));
    } catch (error) {
      console.error('Error fetching data:', error);
      showAlert('Error loading student and instructor data', 'danger');
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Store the submission data and show confirmation modal
    setPendingSubmission({
      students: selectedStudents,
      instructor: selectedInstructor
    });
    setShowConfirmModal(true);
  };

  const confirmSubmit = async () => {
    setIsSubmitting(true);
    try {
      const token = getToken();
      const response = await fetch('http://localhost:8000/student/create-team-notification', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          teamMembers: pendingSubmission.students.map(student => student.value),
          instructorId: pendingSubmission.instructor.value
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit team request');
      }

      showAlert('Team request submitted successfully', 'success');
      checkTeamStatus(); // Refresh the team status
    } catch (error) {
      console.error('Error submitting team request:', error);
      showAlert(error.message || 'Error submitting team request', 'danger');
    } finally {
      setIsSubmitting(false);
      setShowConfirmModal(false);
      setPendingSubmission(null);
    }
  };

  const handleRemoveMember = async () => {
    setIsRemoving(true);
    try {
      const token = getToken();
      const response = await fetch('http://localhost:8000/student/remove-team-member', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          memberToRemove: memberToRemove
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to remove member');
      }

      // Force refresh team status
      await checkTeamStatus();
      
      // Update local state to remove the member
      setTeamStatus(prevStatus => ({
        ...prevStatus,
        teamMembers: prevStatus.teamMembers.filter(member => member !== memberToRemove)
      }));

      showAlert('Team member removed successfully', 'success');
    } catch (error) {
      console.error('Error:', error);
      showAlert(error.message || 'Error removing team member', 'danger');
    } finally {
      setIsRemoving(false);
      setShowRemoveModal(false);
      setMemberToRemove(null);
    }
  };

  const fetchAvailableStudents = async () => {
    try {
      const token = getToken();
      const response = await fetch('http://localhost:8000/student/available-students', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setAvailableStudents(data);
    } catch (error) {
      console.error('Error fetching available students:', error);
      showAlert('Error fetching available students', 'danger');
    }
  };

  const handleAddMember = async () => {
    if (!selectedStudent) {
      showAlert('Please select a student to add', 'warning');
      return;
    }

    setIsAdding(true);
    try {
      const token = getToken();
      const response = await fetch('http://localhost:8000/student/add-team-member', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          newMemberId: selectedStudent.value
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to add member');
      }

      const newMemberName = selectedStudent.label.split(' (')[0];
      setTeamStatus(prevStatus => ({
        ...prevStatus,
        teamMembers: prevStatus.teamMembers ? 
          [...prevStatus.teamMembers, newMemberName] : 
          [newMemberName]
      }));

      setTimeout(() => {
        checkTeamStatus();
      }, 500);

      showAlert('Team member added successfully', 'success');
    } catch (error) {
      console.error('Error:', error);
      showAlert(error.message || 'Error adding team member', 'danger');
    } finally {
      setIsAdding(false);
      setShowAddModal(false);
      setSelectedStudent(null);
    }
  };

  // Add this CSS to your existing CSS file
  const styles = {
    mainContainer: {
      backgroundColor: '#f0f9f0', // Light green background for the entire page
      minHeight: '100vh',
      padding: '20px'
    },
    teamCard: {
      borderRadius: '12px',
      border: 'none',
      boxShadow: '0 8px 16px rgba(46, 125, 50, 0.1)',
      background: '#ffffff',
    },
    headerSection: {
      backgroundColor: '#2e7d32', // Dark green header
      color: 'white',
      borderTopLeftRadius: '12px',
      borderTopRightRadius: '12px',
      padding: '20px'
    },
    memberCard: {
      borderRadius: '10px',
      border: '1px solid #e8f5e9',
      transition: 'all 0.3s ease',
      backgroundColor: '#ffffff',
      marginBottom: '20px',
      '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: '0 6px 15px rgba(46, 125, 50, 0.15)'
      }
    },
    statusBadge: {
      padding: '8px 16px',
      borderRadius: '20px',
      fontSize: '0.85rem',
      fontWeight: '500',
      backgroundColor: '#e8f5e9',
      color: '#2e7d32'
    },
    iconCircle: {
      backgroundColor: '#e8f5e9',
      color: '#2e7d32'
    },
    addMemberButton: {
      position: 'fixed',
      bottom: '30px',
      right: '30px',
      padding: '15px 25px',
      borderRadius: '50px',
      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
      backgroundColor: '#2e7d32',
      color: 'white',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'transform 0.2s',
      '&:hover': {
        transform: 'scale(1.05)',
        backgroundColor: '#1b5e20'
      }
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1050
    },
    modalDialog: {
      width: '100%',
      maxWidth: '500px',
      margin: '20px',
      maxHeight: '90vh',
      display: 'flex',
      flexDirection: 'column'
    },
    modalContent: {
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      maxHeight: '90vh'
    },
    modalBody: {
      padding: '20px',
      overflowY: 'auto'
    },
    modalButton: {
      padding: '10px 24px',
      borderRadius: '8px',
      fontWeight: '500',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      minWidth: '120px'
    },
    cancelButton: {
      backgroundColor: '#f8f9fa',
      border: '1px solid #dee2e6',
      color: '#6c757d',
      '&:hover': {
        backgroundColor: '#e9ecef',
        borderColor: '#dee2e6'
      }
    },
    addButton: {
      backgroundColor: '#2e7d32',
      border: 'none',
      color: 'white',
      '&:hover:not(:disabled)': {
        backgroundColor: '#1b5e20',
        transform: 'translateY(-1px)'
      },
      '&:disabled': {
        backgroundColor: '#4caf50',
        opacity: 0.7
      }
    }
  };

  // Update the modal styles
  const modalStyles = {
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1050,
      padding: '1rem'
    },
    modalContent: {
      backgroundColor: 'white',
      borderRadius: '12px',
      width: '100%',
      maxWidth: '500px',
      maxHeight: '90vh',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden'
    },
    modalHeader: {
      padding: '1.25rem 1.5rem',
      backgroundColor: '#1b5e20',
      color: 'white',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    modalBody: {
      padding: '1.5rem',
      backgroundColor: '#fff',
      overflowY: 'auto',
      flex: 1
    },
    modalFooter: {
      padding: '1.25rem 1.5rem',
      borderTop: '1px solid #e9ecef',
      backgroundColor: '#f8f9fa',
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '0.75rem'
    },
    closeButton: {
      background: 'none',
      border: 'none',
      color: 'white',
      fontSize: '1.5rem',
      padding: '0.25rem',
      cursor: 'pointer',
      opacity: '0.8',
      transition: 'opacity 0.2s',
      '&:hover': {
        opacity: '1'
      }
    }
  };

  return (
    <div className="dashboard-container d-flex">
      {/* Bootstrap Alert Component */}
      {alert.show && (
        <div 
          className={`alert alert-${alert.type} alert-dismissible fade show position-fixed`}
          role="alert"
          style={{
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1050,
            minWidth: '300px',
            maxWidth: '500px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}
        >
          {alert.type === 'success' && <i className="fas fa-check-circle me-2"></i>}
          {alert.type === 'danger' && <i className="fas fa-exclamation-circle me-2"></i>}
          {alert.type === 'warning' && <i className="fas fa-exclamation-triangle me-2"></i>}
          {alert.message}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setAlert({ show: false, message: '', type: '' })}
          ></button>
        </div>
      )}

      <Sidebar />
      <div className="main-section col-10 d-flex flex-column">
        <Header userName={userName} />
        <main className="main-content p-4">
          {loading ? (
            <div className="text-center p-5">
              <div className="spinner-border text-success" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : teamStatus?.hasApprovedTeam ? (
            <div className="card" style={styles.teamCard}>
              <div className="card-header bg-white border-0 py-3">
                <div className="d-flex justify-content-between align-items-center">
                  <h4 className="mb-0 text-success">
                    <FaUsers className="me-2" style={{ color: '#2e7d32' }} />
                    Research Team Members
                  </h4>
                  <span 
                    className="badge" 
                    style={styles.statusBadge}
                  >
                    <i className="fas fa-check-circle me-1"></i>
                    Approved Team
                  </span>
                </div>
              </div>
              <div className="card-body">
                <div className="row g-4">
                  {/* Instructor Section */}
                  <div className="col-md-6">
                    <div className="card h-100" style={styles.memberCard}>
                      <div className="card-body">
                        <div className="d-flex align-items-center mb-3">
                          <div className="rounded-circle p-3" style={styles.iconCircle}>
                            <FaChalkboardTeacher className="fs-4" />
                          </div>
                          <div className="ms-3">
                            <div className="d-flex align-items-center gap-2">
                              <h5 className="mb-1 text-success">{teamStatus.instructor}</h5>
                              <span className="badge bg-primary" 
                                    style={{ 
                                      fontSize: '0.7rem', 
                                      padding: '0.35em 0.65em',
                                      fontWeight: '500'
                                    }}>
                                INSTRUCTOR
                              </span>
                            </div>
                            <div className="d-flex align-items-center mb-2">
                              <FaBookReader className="text-success me-2" />
                              <span className="text-muted">Section: {teamStatus.section}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Team Members Section */}
                  {teamStatus.teamMembers.map((member, index) => (
                    <div className="col-md-6" key={index}>
                      <div className="card h-100" style={styles.memberCard}>
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start">
                            <div className="d-flex align-items-center mb-3">
                              <div className="rounded-circle p-3 bg-success bg-opacity-10">
                                {index === 0 ? (
                                  <FaUserTie className="fs-4 text-success" />
                                ) : (
                                  <FaUsers className="fs-4 text-success" />
                                )}
                              </div>
                              <div className="ms-3">
                                <div className="d-flex align-items-center gap-2">
                                  <h5 className="mb-1 text-success">{member}</h5>
                                  <span className={`badge ${index === 0 ? 'bg-warning' : 'bg-info'}`} 
                                        style={{ 
                                          fontSize: '0.7rem', 
                                          padding: '0.35em 0.65em',
                                          fontWeight: '500'
                                        }}>
                                    {index === 0 ? 'TEAM LEADER' : 'MEMBER'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            {/* Remove Button (if leader) */}
                            {index !== 0 && userName === teamStatus.teamMembers[0] && (
                              <button
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => {
                                  setMemberToRemove(member);
                                  setShowRemoveModal(true);
                                }}
                                disabled={isRemoving}
                              >
                                {isRemoving ? (
                                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                ) : (
                                  <>
                                    <i className="fas fa-user-minus me-1"></i>
                                    Remove
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : teamStatus?.wasRejected ? (
            <div className="card shadow-sm">
                <div className="card-header bg-danger text-white">
                    <h4 className="mb-0">
                        <i className="fas fa-times-circle me-2"></i>
                        Team Request Rejected
                    </h4>
                </div>
                <div className="card-body">
                    <div className="alert alert-danger">
                        <h5 className="alert-heading">
                            <i className="fas fa-exclamation-circle me-2"></i>
                            Your previous team request was rejected
                        </h5>
                        <hr />
                        {teamStatus.rejectionMessage && (
                            <p>
                                <strong>Reason: </strong>{teamStatus.rejectionMessage}
                            </p>
                        )}
                        <p>
                            You can now submit a new team request below.
                        </p>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="form-label">
                                <i className="fas fa-users me-2"></i>
                                Select Team Members
                            </label>
                            <Select
                                isMulti
                                options={students}
                                value={selectedStudents}
                                onChange={setSelectedStudents}
                                placeholder={loadingOptions ? "Loading students..." : "Search and select students..."}
                                isLoading={loadingOptions}
                                isDisabled={loadingOptions}
                                className="basic-multi-select"
                                classNamePrefix="select"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="form-label">
                                <i className="fas fa-chalkboard-teacher me-2"></i>
                                Select Instructor
                            </label>
                            <Select
                                options={instructors}
                                value={selectedInstructor}
                                onChange={setSelectedInstructor}
                                placeholder={loadingOptions ? "Loading instructors..." : "Choose an instructor..."}
                                isLoading={loadingOptions}
                                isDisabled={loadingOptions}
                                className="basic-select"
                                classNamePrefix="select"
                            />
                        </div>

                        <button 
                            type="submit" 
                            className="btn btn-primary btn-lg w-100"
                            disabled={isSubmitting || !selectedStudents.length || !selectedInstructor}
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Sending Request...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-paper-plane me-2"></i>
                                    Send Team Request
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
          ) : teamStatus?.hasPendingRequest ? (
            <div className="card shadow-sm">
              <div className="card-header bg-warning text-dark">
                <h4 className="mb-0">
                  <i className="fas fa-clock me-2"></i>
                  Team Request Status
                </h4>
              </div>
              <div className="card-body">
                <div className="alert alert-warning">
                  <h5 className="alert-heading">
                    <i className="fas fa-hourglass-half me-2"></i>
                    Pending Team Request
                  </h5>
                  <hr />
                  <p>
                    Your team request is currently pending. Please wait for the instructor's response
                    before making any new requests.
                  </p>
                  <p className="mb-0">
                    Check your request status in the{' '}
                    <a href="/notification" className="alert-link">notifications</a> page.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="card shadow-sm">
              <div className="card-header bg-primary text-white">
                <h4 className="mb-0">
                  <i className="fas fa-user-plus me-2"></i>
                  Create Research Team
                </h4>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="form-label">
                      <i className="fas fa-users me-2"></i>
                      Select Team Members
                    </label>
                    <Select
                      isMulti
                      options={students}
                      value={selectedStudents}
                      onChange={setSelectedStudents}
                      placeholder={loadingOptions ? "Loading students..." : "Search and select students..."}
                      isLoading={loadingOptions}
                      isDisabled={loadingOptions}
                      className="basic-multi-select"
                      classNamePrefix="select"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label">
                      <i className="fas fa-chalkboard-teacher me-2"></i>
                      Select Instructor
                    </label>
                    <Select
                      options={instructors}
                      value={selectedInstructor}
                      onChange={setSelectedInstructor}
                      placeholder={loadingOptions ? "Loading instructors..." : "Choose an instructor..."}
                      isLoading={loadingOptions}
                      isDisabled={loadingOptions}
                      className="basic-select"
                      classNamePrefix="select"
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary btn-lg w-100"
                    disabled={isSubmitting || !selectedStudents.length || !selectedInstructor}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Sending Request...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane me-2"></i>
                        Send Team Request
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}
        </main>

        {/* Confirmation Modal */}
        <div 
          className={`modal fade ${showConfirmModal ? 'show' : ''}`} 
          style={{ display: showConfirmModal ? 'block' : 'none', backgroundColor: 'rgba(0,0,0,0.5)' }}
          tabIndex="-1"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Team Request</h5>
                <button type="button" className="btn-close" onClick={() => setShowConfirmModal(false)}></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to send this team request?</p>
                <strong>Team Members:</strong>
                <ul>
                  {pendingSubmission?.students.map((student, index) => (
                    <li key={index}>{student.label}</li>
                  ))}
                </ul>
                <strong>Instructor:</strong>
                <p>{pendingSubmission?.instructor.label}</p>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowConfirmModal(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={confirmSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Confirming...
                    </>
                  ) : (
                    'Confirm'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Remove Confirmation Modal */}
        {showRemoveModal && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Remove Team Member</h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setShowRemoveModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <p>Are you sure you want to remove <strong>{memberToRemove}</strong> from the team?</p>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowRemoveModal(false)}
                    disabled={isRemoving}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-danger" 
                    onClick={handleRemoveMember}
                    disabled={isRemoving}
                  >
                    {isRemoving ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Removing...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-user-minus me-2"></i>
                        Remove Member
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {isLeader && (
          <button
            className="btn btn-success btn-lg"
            style={styles.addMemberButton}
            onClick={() => {
              fetchAvailableStudents();
              setShowAddModal(true);
            }}
          >
            <i className="fas fa-user-plus fa-lg"></i>
            <span>Add Member</span>
          </button>
        )}

        {showAddModal && (
          <div style={modalStyles.modalOverlay}>
            <div style={modalStyles.modalContent}>
              <div style={modalStyles.modalHeader}>
                <h5 className="m-0 d-flex align-items-center gap-2">
                  <i className="fas fa-user-plus"></i>
                  Add New Team Member
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowAddModal(false)}
                  disabled={isAdding}
                  aria-label="Close"
                  style={{ 
                    padding: '0.5rem',
                    marginRight: '-0.5rem'
                  }}
                />
              </div>

              <div style={modalStyles.modalBody}>
                <div className="mb-4">
                  <label className="form-label mb-2 fw-medium text-dark">
                    Select Student
                  </label>
                  <Select
                    options={availableStudents.map(student => ({
                      value: student._id,
                      label: `${student.name} (${student.studentId})`
                    }))}
                    value={selectedStudent}
                    onChange={setSelectedStudent}
                    isDisabled={isAdding}
                    placeholder="Search for a student..."
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        borderColor: state.isFocused ? '#2e7d32' : '#dee2e6',
                        boxShadow: state.isFocused ? '0 0 0 1px #2e7d32' : 'none',
                        '&:hover': {
                          borderColor: '#2e7d32'
                        }
                      }),
                      option: (base, state) => ({
                        ...base,
                        padding: '10px 12px',
                        backgroundColor: state.isSelected ? '#2e7d32' : 
                                        state.isFocused ? '#f0f9f0' : 'white',
                        color: state.isSelected ? 'white' : '#333',
                        '&:active': {
                          backgroundColor: '#2e7d32'
                        }
                      }),
                      menu: (base) => ({
                        ...base,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        border: '1px solid #dee2e6',
                        zIndex: 1051
                      }),
                      menuList: (base) => ({
                        ...base,
                        maxHeight: '200px'
                      })
                    }}
                    maxMenuHeight={200}
                  />
                  {availableStudents.length === 0 && (
                    <div className="alert alert-info mt-3 d-flex align-items-center gap-2 mb-0">
                      <i className="fas fa-info-circle"></i>
                      <span>No available students found</span>
                    </div>
                  )}
                </div>
              </div>

              <div style={modalStyles.modalFooter}>
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() => setShowAddModal(false)}
                  disabled={isAdding}
                  style={{
                    ...modalStyles.cancelButton,
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  style={modalStyles.addButton}
                  onClick={handleAddMember}
                  disabled={isAdding || !selectedStudent}
                >
                  {isAdding ? (
                    <div className="d-flex align-items-center gap-2">
                      <div className="spinner-border spinner-border-sm" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      Adding...
                    </div>
                  ) : (
                    <div className="d-flex align-items-center gap-2">
                      <i className="fas fa-user-plus"></i>
                      Add Member
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageMember;
