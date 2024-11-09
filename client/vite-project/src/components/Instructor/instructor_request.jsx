import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './resources/Sidebar';
import Header from './resources/Header';
import { getUserName, getToken } from './resources/Utils';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Dashboard.css';
import '../css/Dashboard2.css';
import '../css/admin_dashboard.css';


const InstructorRequest = () => {
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
  
  // Static list of research titles (placeholder)
  const researchList = [
    "AI in Smart Parking Systems",
    "IoT-based Emission Monitoring",
    "Vehicle Speed Sensor Development",
    "Smart Exhaust Emissions Detector",
  ];

  const [selectedResearch, setSelectedResearch] = useState("");

  // Handler for dropdown change
  const handleResearchChange = (e) => {
    setSelectedResearch(e.target.value);
  };

  return (
    <div className="dashboard-container d-flex">
      <Sidebar />
      <div className="main-section col-10 d-flex flex-column">
        <Header userName={userName} />

        <main className="main-content p-4">
        <div className="container mt-4 notify">
          <h4 className="my-3">REQUEST AS ADVISER</h4>
          <div className="card mt-4">
            <div className="card-body">
              <form>
                <div className="mb-3">
                  <label htmlFor="researchSelect" className="form-label">Select Research to Apply As Adviser</label>
                  <select 
                    id="researchSelect" 
                    className="form-select" 
                    value={selectedResearch} 
                    onChange={handleResearchChange}
                  >
                    <option value="">Choose a research project...</option>
                    {researchList.map((research, index) => (
                      <option key={index} value={research}>{research}</option>
                    ))}
                  </select>
                </div>
                <div className="text-center">
                  <button type="submit" className="btn btn-primary">
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default InstructorRequest;
