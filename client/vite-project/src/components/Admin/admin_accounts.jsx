import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './resources/Sidebar';
import Header from './resources/Header';
import { getUserName, getToken } from './resources/Utils';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Dashboard.css';
import '../css/Dashboard2.css';
import '../css/admin_dashboard.css';

const AdminAccounts = () => {
  const navigate = useNavigate();
  const [userName] = useState(getUserName());
  const [students, setStudents] = useState([]); // State to store student data

  useEffect(() => {
    const token = getToken();
    alert('Token:', token); // Check the token value
    if (!token) {
      alert('Please log in first.');
      localStorage.removeItem('userName');
      localStorage.removeItem('token');
      navigate('/');
      return;
    }

    // Fetch students data from backend
    const fetchStudents = async () => {
      try {
        const response = await fetch('http://localhost:8000/admin/accounts/students', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch student data');
        }

        const data = await response.json();
        console.log(data); // Check if the data is being returned
        setStudents(data); // Assuming `data` is an array of student objects
      } catch (error) {
  console.error('Error fetching student data:', error);
  alert('Failed to fetch student data');      }
    };

    fetchStudents();
  }, [navigate]);

  return (
    <div className="dashboard-container d-flex">
      <Sidebar />
      <div className="main-section col-10 d-flex flex-column">
        <Header userName={userName} />

        <main className="main-content">
          <div className="container">
            <h4 className="my-3">User Accounts Management</h4>
            <ul className="nav nav-tabs">
            </ul>

            <table className="table table-green-theme table-striped table-bordered mt-3">
              <thead className="table-primary">
                <tr>
                  <th className="centering">Name</th>
                  <th className="centering">Role</th>
                  <th className="centering">Email</th>
                  <th className="centering">View</th>
                  <th className="centering">Actions</th>
                </tr>
              </thead>
              <tbody>
  {students.length === 0 ? (
    <tr>
      <td colSpan="5" className="text-center">No students available</td>
    </tr>
  ) : (
    students.map((student) => (
      <tr key={student.id}>
        <td>{student.name}</td>
        <td>{student.role}</td>
        <td>{student.email}</td>
        <td><button className="btn btn-info btn-sm">View</button></td>
        <td><button className="btn btn-danger btn-sm">Delete</button></td>
      </tr>
    ))
  )}
</tbody>

            </table>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminAccounts;
