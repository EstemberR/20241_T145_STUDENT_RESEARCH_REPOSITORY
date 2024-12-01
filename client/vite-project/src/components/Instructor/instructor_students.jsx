import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './resources/Sidebar';
import Header from './resources/Header';
import { getUserName, getToken } from './resources/Utils';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Dashboard.css';
import '../css/Dashboard2.css';
import '../css/admin_dashboard.css';

const RESEARCH_STATUS = {
  PENDING: 'Pending',
  APPROVED: 'Accepted',
  REVISE: 'Revision',
  REJECTED: 'Rejected'
};

const InstructorStudents = () => {
  const navigate = useNavigate();
  const [userName] = useState(getUserName());
  const [userRole, setUserRole] = useState([]);
  const [students, setStudents] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudent, setNewStudent] = useState({
    studentId: '',
    section: ''
  });
  const [error, setError] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    teamId: null,
    teamLeaderName: null
  });

  // Add showAlert function
  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: '' }), 3000);
  };

  // Move fetchUserAndStudents outside useEffect so it can be reused
  const fetchUserAndStudents = async () => {
    try {
      const token = getToken();
      if (!token) {
        alert('Please log in first.');
        localStorage.removeItem('userName');
        localStorage.removeItem('token');
        navigate('/');
        return;
      }

      // Fetch user role
      const profileResponse = await fetch('http://localhost:8000/instructor/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const profileData = await profileResponse.json();
      setUserRole(profileData.role);

      // Fetch students with their team information
      const studentsResponse = await fetch('http://localhost:8000/instructor/students', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const studentsData = await studentsResponse.json();

      // Group students by team
      const groupedStudents = {};
      for (const student of studentsData) {
        if (student.managedBy) {
          const research = await fetch(`http://localhost:8000/instructor/research/${student._id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const researchData = await research.json();
          
          if (researchData) {
            const teamId = researchData.mongoId; // Team leader's ID
            if (!groupedStudents[teamId]) {
              groupedStudents[teamId] = {
                teamLeader: student,
                members: [],
                section: student.section
              };
            }
            if (student._id === researchData.mongoId) {
              groupedStudents[teamId].teamLeader = student;
            } else {
              groupedStudents[teamId].members.push(student);
            }
          }
        }
      }
      setStudents(groupedStudents);
    } catch (error) {
      console.error('Error fetching data:', error);
      showAlert('Error fetching data', 'danger');
    }
  };

  // Update useEffect to use the moved function
  useEffect(() => {
    fetchUserAndStudents();
  }, [navigate]);

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      const token = getToken();
      const response = await fetch('http://localhost:8000/instructor/students/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newStudent)
      });

      const data = await response.json();
      if (response.ok) {
        setStudents([...students, data]);
        setShowAddModal(false);
        setNewStudent({ studentId: '', section: '' });
        setError('');
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Error adding student:', error);
      setError('Failed to add student');
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (window.confirm('Are you sure you want to remove this student?')) {
      try {
        const token = getToken();
        const response = await fetch(`http://localhost:8000/instructor/students/${studentId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          setStudents(students.filter(student => student.studentId !== studentId));
        } else {
          const data = await response.json();
          setError(data.message);
        }
      } catch (error) {
        console.error('Error deleting student:', error);
        setError('Failed to delete student');
      }
    }
  };

  const handleViewStudent = async (student) => {
    try {
      const token = getToken();
      const response = await fetch(`http://localhost:8000/instructor/students/${student._id}/details`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const detailedStudent = await response.json();
        setSelectedStudent({
          ...student,
          ...detailedStudent,
          submissions: detailedStudent.submissions || []
        });
        setShowViewModal(true);
      }
    } catch (error) {
      console.error('Error fetching student details:', error);
      showAlert('Error fetching student details', 'danger');
    }
  };

  // Update handleDeleteGroup to show modal first
  const handleDeleteGroup = (teamId, teamLeaderName) => {
    setConfirmModal({
      show: true,
      teamId,
      teamLeaderName
    });
  };

  // Add new function to handle the actual deletion
  const confirmDeleteGroup = async () => {
    try {
      const token = getToken();
      const response = await fetch(`http://localhost:8000/instructor/teams/${confirmModal.teamId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const updatedStudents = { ...students };
        delete updatedStudents[confirmModal.teamId];
        setStudents(updatedStudents);
        showAlert('Team has been dissolved successfully', 'success');
      } else {
        showAlert('Failed to dissolve team', 'danger');
      }
    } catch (error) {
      console.error('Error dissolving team:', error);
      showAlert('Error dissolving team', 'danger');
    } finally {
      setConfirmModal({ show: false, teamId: null, teamLeaderName: null });
    }
  };

  return (
    <div className="dashboard-container d-flex">
      <Sidebar />
      <div className="main-section col-10">
        <Header userName={userName} userRole={userRole} />
        {/* Add Alert component at the top of content */}
        {alert.show && (
          <div className={`alert alert-${alert.type} alert-dismissible fade show m-3`} role="alert">
            {alert.message}
            <button type="button" className="btn-close" onClick={() => setAlert({ show: false, message: '', type: '' })}></button>
          </div>
        )}
        <div className="content-wrapper" style={{ height: 'calc(100vh - 60px)', overflowY: 'auto' }}>
          <main className="p-4">
            <h5 className="mb-4">Research Teams</h5>
            {Object.entries(students).map(([teamId, team]) => (
              <div key={teamId} className="card mb-4">
                <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-0">Team Leader: {team.teamLeader.name}</h6>
                    <small>Section: {team.section}</small>
                  </div>
                  <button 
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDeleteGroup(teamId, team.teamLeader.name)}
                  >
                    <i className="fas fa-users-slash me-2"></i>
                    Dissolve Team
                  </button>
                </div>
                <div className="card-body">
                  <div className="row">
                    {/* Team Leader Card */}
                    <div className="col-md-4 mb-3">
                      <div className="card h-100 border-primary">
                        <div className="card-body">
                          <h6 className="card-title">
                            {team.teamLeader.name}
                            <span className="badge bg-primary ms-2">Team Leader</span>
                          </h6>
                          <p className="card-text">
                            <strong>Student ID:</strong> {team.teamLeader.studentId}<br />
                            <strong>Email:</strong> {team.teamLeader.email}<br />
                            <strong>Course:</strong> {team.teamLeader.course}<br />
                            <strong>Section:</strong> {team.teamLeader.section}
                          </p>
                          <button 
                            className="btn btn-success btn-sm w-100"
                            onClick={() => handleViewStudent(team.teamLeader)}
                          >
                            <i className="fas fa-eye me-2"></i>
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                    {/* Team Members Cards */}
                    {team.members.map(member => (
                      <div key={member._id} className="col-md-4 mb-3">
                        <div className="card h-100 border-success">
                          <div className="card-body">
                            <h6 className="card-title">{member.name}</h6>
                            <p className="card-text">
                              <strong>Student ID:</strong> {member.studentId}<br />
                              <strong>Email:</strong> {member.email}<br />
                              <strong>Course:</strong> {member.course}<br />
                              <strong>Section:</strong> {member.section}
                            </p>
                            <button 
                              className="btn btn-success btn-sm w-100"
                              onClick={() => handleViewStudent(member)}
                            >
                              <i className="fas fa-eye me-2"></i>
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </main>
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Student</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
              </div>
              <div className="modal-body">
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleAddStudent}>
                  <div className="mb-3">
                    <label className="form-label">Student ID</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newStudent.studentId}
                      onChange={(e) => setNewStudent({...newStudent, studentId: e.target.value})}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Section</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newStudent.section}
                      onChange={(e) => setNewStudent({...newStudent, section: e.target.value})}
                      placeholder="e.g., 3-A"
                      required
                    />
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                      Close
                    </button>
                    <button type="submit" className="btn btn-success">
                      Add Student
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add the View Student Modal */}
      {showViewModal && selectedStudent && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Student Details</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedStudent(null);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-4 text-center mb-3">
                    <img
                      src="https://via.placeholder.com/150"
                      alt="Student"
                      className="rounded-circle mb-3"
                      style={{ width: '150px', height: '150px' }}
                    />
                    <h4>{selectedStudent.name}</h4>
                    <p className="text-muted">{selectedStudent.studentId}</p>
                  </div>
                  <div className="col-md-8">
                    <div className="card">
                      <div className="card-body">
                        <h6 className="text-success mb-3">Personal Information</h6>
                        <p><strong>Full Name:</strong> {selectedStudent.name}</p>
                        <p><strong>Email:</strong> {selectedStudent.email}</p>
                        <p><strong>Course:</strong> {selectedStudent.course}</p>
                        <p><strong>Section:</strong> {selectedStudent.section}</p>
                        
                        <h6 className="text-success mb-3 mt-4">Academic Information</h6>
                        <p><strong>Status:</strong> {selectedStudent.status || 'Active'}</p>
                        
                        {selectedStudent.submissions && selectedStudent.submissions.length > 0 && (
                          <>
                            <h6 className="text-success mb-3 mt-4">Recent Submissions</h6>
                            <ul className="list-group">
                              {selectedStudent.submissions.map(submission => (
                                <li key={submission._id} className="list-group-item">
                                  <p className="mb-1"><strong>{submission.title}</strong></p>
                                  <small className="text-muted">
                                    Status: {submission.status} | 
                                    Submitted: {new Date(submission.createdAt).toLocaleDateString()}
                                  </small>
                                </li>
                              ))}
                            </ul>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedStudent(null);
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add the confirmation modal to your JSX (add this before the closing div of your component) */}
      {confirmModal.show && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Team Dissolution</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setConfirmModal({ show: false, teamId: null, teamLeaderName: null })}
                ></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to dissolve {confirmModal.teamLeaderName}'s team?</p>
                <p className="text-muted small">This action cannot be undone.</p>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setConfirmModal({ show: false, teamId: null, teamLeaderName: null })}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger" 
                  onClick={confirmDeleteGroup}
                >
                  Dissolve Team
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorStudents;
