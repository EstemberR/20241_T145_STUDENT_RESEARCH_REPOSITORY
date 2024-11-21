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

  useEffect(() => {
    const token = getToken();
    if (!token) {
      alert('Please log in first.');
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
      console.log('Team status response:', data);
      setTeamStatus(data);
      
      if (data.hasApprovedTeam) {
        // Show approved team view
        return;
      } else if (data.hasPendingRequest) {
        // Show pending request view
        return;
      } else {
        // Only fetch students and instructors if no team or pending request
        await fetchStudentsAndInstructors();
      }
    } catch (error) {
      console.error('Error checking team status:', error);
      alert('Error checking team status');
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
      alert('Error loading data');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Validation
    if (!selectedInstructor || selectedStudents.length === 0) {
      alert('Please select both an Instructor and Team Members');
      setLoading(false);
      return;
    }

    try {
      const token = getToken();
      
      // First create the team notification
      const notificationResponse = await fetch('http://localhost:8000/student/create-team-notification', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          instructorId: selectedInstructor.value,
          teamMembers: selectedStudents.map(s => s.value)
        })
      });

      if (!notificationResponse.ok) {
        const errorData = await notificationResponse.json();
        throw new Error(errorData.message || 'Failed to send team request');
      }

      alert('Team request sent successfully. Awaiting instructor approval.');
      navigate('/notification');
    } catch (error) {
      console.error('Error updating team:', error);
      alert(error.message || 'Error sending team request');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container d-flex">
        <Sidebar />
        <div className="main-section col-10 d-flex flex-column">
          <Header userName={userName} />
          <main className="main-content p-4">
            <div className="text-center">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (teamStatus?.hasApprovedTeam) {
    return (
      <div className="dashboard-container d-flex">
        <Sidebar />
        <div className="main-section col-10 d-flex flex-column">
          <Header userName={userName} />
          <main className="main-content p-4">
            <div className="card">
              <div className="card-header">
                <h4>Your Research Team</h4>
              </div>
              <div className="card-body">
                <Alert variant="success">
                  <Alert.Heading>
                    <i className="bi bi-check-circle me-2"></i>
                    Approved Team
                  </Alert.Heading>
                  <hr />
                  <p><strong>Instructor:</strong> {teamStatus.instructor}</p>
                  <p><strong>Section:</strong> {teamStatus.section}</p>
                  <p><strong>Team Members:</strong></p>
                  <ul>
                    {teamStatus.teamMembers.map((member, index) => (
                      <li key={index}>{member}</li>
                    ))}
                  </ul>
                </Alert>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (teamStatus?.hasPendingRequest) {
    return (
      <div className="dashboard-container d-flex">
        <Sidebar />
        <div className="main-section col-10 d-flex flex-column">
          <Header userName={userName} />
          <main className="main-content p-4">
            <div className="card">
              <div className="card-header">
                <h4>Team Request Status</h4>
              </div>
              <div className="card-body">
                <Alert variant="warning">
                  <Alert.Heading>
                    <i className="bi bi-hourglass-split me-2"></i>
                    Pending Team Request
                  </Alert.Heading>
                  <hr />
                  <p>
                    You currently have a pending team request. Please wait for the instructor's response
                    before making any new requests.
                  </p>
                  <p className="mb-0">
                    You can check the status of your request in the{' '}
                    <Alert.Link href="/notification">notifications</Alert.Link> page.
                  </p>
                </Alert>
                <div className="alert alert-info">
                  <i className="bi bi-info-circle me-2"></i>
                  Your request will be reviewed by the instructor. You'll receive a notification once it's processed.
                </div>
              </div>
            </div>
          </main>
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
          <div className="card">
            <div className="card-header">
              <h4>Manage Project Members</h4>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Select Team Members</label>
                  <Select
                    isMulti
                    options={students}
                    value={selectedStudents}
                    onChange={setSelectedStudents}
                    placeholder="Search and select students..."
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Select Instructor</label>
                  <Select
                    options={instructors}
                    value={selectedInstructor}
                    onChange={setSelectedInstructor}
                    placeholder="Choose an instructor..."
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Update Team Members'}
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ManageMember;
