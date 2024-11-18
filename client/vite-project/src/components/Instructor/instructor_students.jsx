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

  // Fetch students
  useEffect(() => {
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
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const profileData = await profileResponse.json();
        if (profileResponse.ok) {
          setUserRole(profileData.role);
        }

        // Fetch students
        const studentsResponse = await fetch('http://localhost:8000/instructor/students', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const studentsData = await studentsResponse.json();
        if (studentsResponse.ok) {
          setStudents(studentsData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

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

  const handleViewStudent = async (id) => {
    try {
      const token = getToken();
      const response = await fetch(`http://localhost:8000/instructor/students/${id}/details`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      console.log('Student details received:', data);
      console.log('Submissions:', data.submissions);
      if (response.ok) {
        setSelectedStudent(data);
        setShowViewModal(true);
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Error fetching student details:', error);
      setError('Failed to fetch student details');
    }
  };

  return (
    <div className="dashboard-container d-flex">
      <Sidebar />
      <div className="main-section col-10 d-flex flex-column">
      <Header userName={userName} userRole={userRole} />
        <main className="main-content">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4>STUDENT PROFILES</h4>
              <button 
                className="btn btn-success" 
                onClick={() => setShowAddModal(true)}
              >
                Add Student
              </button>
            </div>
            <div className="container">
              <div className="row">
                {students.map((student) => (
                  <div key={student._id} className="col-md-4 mb-4">
                    <div className="card">
                      <div className="card-body">
                        <h5 className="card-title">{student.name}</h5>
                        <p className="card-text">
                          <strong>Student ID:</strong> {student.studentId}<br />
                          <strong>Email:</strong> {student.email}<br />
                          <strong>Course:</strong> {student.course}<br />
                          <strong>Section:</strong> {student.section}
                        </p>
                        <div className="d-flex gap-2">
                          <button 
                            className="btn btn-success btn-sm"
                            onClick={() => handleViewStudent(student.studentId)}
                          >
                            <i className="fas fa-eye me-2"></i>
                            View Details
                          </button>
                          <button 
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteStudent(student.studentId)}
                          >
                            <i className="fas fa-trash-alt me-2"></i>
                            Remove Student
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
        </main>
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
    </div>
  );
};

export default InstructorStudents;
