import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './resources/Sidebar';
import Header from './resources/Header';
import { getUserName, getToken } from './resources/Utils';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Dashboard.css';
import '../css/Dashboard2.css';
import '../css/admin_dashboard.css';

const InstructorSubmissions = () => {
  const navigate = useNavigate();
  const [userName] = useState(getUserName());

  useEffect(() => {
    const token = getToken();
    if (!token) {
      localStorage.removeItem('userName');
      localStorage.removeItem('token');
      alert('Please log in first.');
      navigate('/');
    }
  }, [navigate]);
  const [selectedResearch, setSelectedResearch] = useState(null);
const [activeTab, setActiveTab] = useState('Pending'); // State to control which table is shown
// Sample data
const researchData = [
    { id: 1, title: 'Research Paper 1', author: 'Kyoya Hibari', date: '2024-01-01', status: 'Accepted' },
    { id: 2, title: 'Research Paper 2', author: 'Gon freeks', date: '2024-02-01', status: 'Pending' },
    { id: 3, title: 'Research Paper 3', author: 'Alice MLBB', date: '2024-03-15', status: 'Rejected' },
  ];
  
  const handleViewClick = (research) => {
    setSelectedResearch(research);
    const viewModal = new window.bootstrap.Modal(document.getElementById('viewModal'));
    viewModal.show();
  };
  
  // Filter data based on the active tab
  const filteredData = researchData.filter((research) => research.status === activeTab);

  return (
    <div className="dashboard-container d-flex">
      <Sidebar />
      <div className="main-section col-10 d-flex flex-column">
        <Header userName={userName} />

        <main className="main-content">
        <div className="container">
          <h4 className="my-3">STUDENT SUBMISSIONS</h4>
          <ul className="nav nav-tabs">
            <li className="nav-item pending">
              <button
                className={`nav-link ${activeTab === 'Pending' ? 'active' : ''} x`}
                onClick={() => setActiveTab('Pending')}
              >
                Pending
              </button>
            </li>
            <li className="nav-item accepted">
              <button
                className={`nav-link ${activeTab === 'Accepted' ? 'active' : ''} x`}
                onClick={() => setActiveTab('Accepted')}
              >
                Accepted
              </button>
            </li>
            <li className="nav-item archived">
              <button
                className={`nav-link ${activeTab === 'Rejected' ? 'active' : ''} x`}
                onClick={() => setActiveTab('Rejected')}
              >
                Rejected
              </button>
            </li>
          </ul>

          {/* Table for Active Tab */}
          <table className="table table-green-theme table-striped table-bordered mt-3">
            <thead className="table-primary">
              <tr>
                <th className="centering">ID</th>
                <th className="centering">Title</th>
                <th className="centering">Student</th>
                <th className="centering">Date Submitted</th>
                <th className="centering">Status</th>
                <th className="centering">View</th>
                <th className="centering">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((research) => (
                <tr key={research.id}>
                  <td className="centering">{research.id}</td>
                  <td className="centering">{research.title}</td>
                  <td className="centering">{research.author}</td>
                  <td className="centering">{research.date}</td>
                  <td className="centering">{research.status}</td>
                  <td className="centering">
                    <button
                      className="btn btn-info btn-sm"
                      onClick={() => handleViewClick(research)}>
                      <i className="fas fa-eye"></i> View
                    </button>
                  </td>
                  <td className="centering">
                    {activeTab === 'Pending' && (
                        <>
                          <button className="btn btn-success btn-sm ms-2">
                            <i className="fas fa-check"></i> Accept
                          </button>
                          <button className="btn btn-danger btn-sm ms-2">
                            <i className="fas fa-times"></i> Reject
                          </button>
                        </>
                      )}
                      {activeTab === 'Rejected' && (
                        <button className="btn btn-warning btn-sm ms-2">
                           <i className="fas fa-file-alt submission"></i> Add Note
                        </button>
                      )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </main>
      </div>
    </div>
  );
};

export default InstructorSubmissions;
