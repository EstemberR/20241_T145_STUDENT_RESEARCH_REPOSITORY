import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getToken } from './resources/Utils';
import Header from './resources/Header';
import Sidebar from './resources/Sidebar';

const ResearchDetails = () => {
  const { id } = useParams();
  const [research, setResearch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResearchDetails = async () => {
      try {
        const token = getToken();
        const response = await fetch(`http://localhost:8000/student/research/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error('Research not found');
        
        const data = await response.json();
        setResearch(data);
        setLoading(false);
      } catch (error) {
        console.error('Error:', error);
        setLoading(false);
      }
    };

    fetchResearchDetails();
  }, [id]);

  if (loading) return <div className="text-center p-5"><div className="spinner-border"></div></div>;
  if (!research) return <div className="text-center p-5">Research not found</div>;

  return (
    <div className="dashboard-container d-flex">
      <Sidebar />
      <div className="main-section col-10 d-flex flex-column">
        <Header userName={research.student?.name || 'User'} />
        <main className="main-content p-4">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h2 className="mb-4">{research.title}</h2>
              
              <div className="row mb-4">
                <div className="col-md-4">
                  <h5>Authors</h5>
                  <p>{research.authors}</p>
                </div>
                <div className="col-md-4">
                  <h5>Course</h5>
                  <p>{research.course || research.student?.course}</p>
                </div>
                <div className="col-md-4">
                  <h5>Keywords</h5>
                  <p>{research.keywords}</p>
                </div>
              </div>

              <div className="mb-4">
                <h5>Abstract</h5>
                <p className="text-justify">{research.abstract}</p>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <h5>Publication Date</h5>
                  <p>{new Date(research.uploadDate).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}</p>
                </div>
                <div className="col-md-6">
                  <h5>Full Document</h5>
                  <a 
                    href={`https://drive.google.com/file/d/${research.driveFileId}/view`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-success"
                  >
                    <i className="fas fa-external-link-alt me-2"></i>
                    View Document
                  </a>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ResearchDetails; 