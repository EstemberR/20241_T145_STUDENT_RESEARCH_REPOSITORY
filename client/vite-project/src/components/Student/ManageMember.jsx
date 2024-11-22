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
  }, [navigate]);

  const checkTeamStatus = async () => {
    try {
      const token = getToken();
      const response = await fetch('http://localhost:8000/student/check-team-status', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      setTeamStatus(data);
      
      if (!data.hasApprovedTeam && !data.hasPendingRequest) {
        await fetchStudentsAndInstructors();
      }
    } catch (error) {
      console.error('Error checking team status:', error);
      showAlert('Error checking team status', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsAndInstructors = async () => {
    try {
      const token = getToken();
      const [studentsRes, instructorsRes] = await Promise.all([
        fetch('http://localhost:8000/student/all-students', {
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
      const response = await fetch('http://localhost:8000/student/team-request', {
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
            <div className="card shadow-sm">
              <div className="card-header bg-white">
                <h4 className="mb-0">PROJECT MEMBERS</h4>
              </div>
              <div className="card-body">
                <div className="alert alert-success border-success">
                  <h5 className="alert-heading">
                    <i className="fas fa-check-circle me-2"></i>
                    Approved Team
                  </h5>
                  <hr />
                  <div className="row">
                    <div className="col-md-6">
                      <p><i className="fas fa-chalkboard-teacher me-2"></i><strong>Instructor:</strong> {teamStatus.instructor}</p>
                      <p><i className="fas fa-door-open me-2"></i><strong>Section:</strong> {teamStatus.section}</p>
                    </div>
                    <div className="col-md-6">
                      <p><i className="fas fa-users me-2"></i><strong>Team Members:</strong></p>
                      <ul className="list-group">
                        {teamStatus.teamMembers.map((member, index) => (
                          <li key={index} className="list-group-item border-0 ps-0">
                            <i className="fas fa-user me-2"></i>{member}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
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
                                placeholder="Search and select students..."
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
                                placeholder="Choose an instructor..."
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
                      placeholder="Search and select students..."
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
                      placeholder="Choose an instructor..."
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
        <div className="modal fade" id="confirmModal" tabIndex="-1" 
          show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
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
      </div>
    </div>
  );
};

export default ManageMember;
