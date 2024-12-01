import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getToken } from './resources/Utils';
import Header from './resources/Header';
import Sidebar from './resources/Sidebar';
import { FaUsers, FaGraduationCap, FaTags, FaCalendarAlt, FaFilePdf } from 'react-icons/fa';

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

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center min-vh-100">
      <div className="spinner-border text-success" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
  
  if (!research) return (
    <div className="d-flex justify-content-center align-items-center min-vh-100">
      <div className="text-center">
        <h3>Research not found</h3>
        <p className="text-muted">The requested research paper could not be found.</p>
      </div>
    </div>
  );

  return (
    <div className="dashboard-container d-flex">
      <Sidebar />
      <div className="main-section col-10 d-flex flex-column">
        <Header userName={research.student?.name || 'User'} />
        <main className="main-content p-4">
          <div className="card shadow-lg border-0">
            <div className="card-header text-white py-3">
              <h2 className="mb-0">{research.title}</h2>
            </div>
            <div className="card-body p-4">
              <div className="row g-4">
                {/* Meta Information */}
                <div className="col-12">
                  <div className="d-flex flex-wrap gap-4 mb-4">
                    <div className="d-flex align-items-center">
                      <FaUsers className="text-success me-2" size={20} />
                      <div>
                        <small className="text-muted d-block">Authors</small>
                        <strong>{research.authors}</strong>
                      </div>
                    </div>
                    <div className="d-flex align-items-center">
                      <FaGraduationCap className="text-success me-2" size={20} />
                      <div>
                        <small className="text-muted d-block">Course</small>
                        <strong>{research.course || research.student?.course}</strong>
                      </div>
                    </div>
                    <div className="d-flex align-items-center">
                      <FaCalendarAlt className="text-success me-2" size={20} />
                      <div>
                        <small className="text-muted d-block">Publication Date</small>
                        <strong>
                          {new Date(research.uploadDate).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Keywords */}
                <div className="col-12">
                  <div className="d-flex align-items-center mb-3">
                    <FaTags className="text-success me-2" size={20} />
                    <h5 className="mb-0">Keywords</h5>
                  </div>
                  <div className="d-flex flex-wrap gap-2">
                    {research.keywords.split(',').map((keyword, index) => (
                      <span key={index} className="badge bg-success bg-opacity-10 text-success border border-success">
                        {keyword.trim()}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Abstract */}
                <div className="col-12">
                  <div className="card bg-light border-0" style={{ backgroundColor: '#f8f9fa' }}>
                    <div className="card-body">
                      <h5 className="card-title mb-3 text-success">Abstract</h5>
                      <p className="card-text text-justify mb-0" style={{ lineHeight: '1.8' }}>
                        {research.abstract}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Document Link */}
                <div className="col-12 text-center">
                  <a 
                    href={`https://drive.google.com/file/d/${research.driveFileId}/view`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-success btn-lg"
                  >
                    <FaFilePdf className="me-2" />
                    View Full Document
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