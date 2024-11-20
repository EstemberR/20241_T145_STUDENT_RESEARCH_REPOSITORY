import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './resources/Sidebar';
import Header from './resources/Header';
import { getUserName, getToken } from './resources/Utils';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Dashboard.css';
import '../css/ResearchRepository.css';

const Repository = () => {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const [userName] = useState(getUserName());
  const [researches, setResearches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredResearches, setFilteredResearches] = useState([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    course: '',
    keywords: ''
  });

  // Fetch all accepted researches
  useEffect(() => {
    const fetchResearches = async () => {
      try {
        const token = getToken();
        if (!token) {
          alert('Please log in first.');
          localStorage.removeItem('userName');
          localStorage.removeItem('token');
          navigate('/');
          return;
        }

        const response = await fetch('http://localhost:8000/student/all-research', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error('Failed to fetch researches');
        
        const data = await response.json();
        // Filter only accepted researches
        const acceptedResearches = data.filter(research => research.status === 'Accepted');
        setResearches(acceptedResearches);
        setFilteredResearches(acceptedResearches);
        setLoading(false);
      } catch (error) {
        console.error('Error:', error);
        setLoading(false);
      }
    };

    fetchResearches();
  }, [navigate]);

  // Handle search
  useEffect(() => {
    const results = researches.filter(research =>
      research.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      research.authors.toLowerCase().includes(searchTerm.toLowerCase()) ||
      research.keywords.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredResearches(results);
  }, [searchTerm, researches]);

  const handleCardClick = (researchId) => {
    window.open(`/repository/${researchId}`, '_blank');
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyFilters = () => {
    let results = [...researches];

    // Date range filter
    if (filters.dateFrom || filters.dateTo) {
      results = results.filter(research => {
        const uploadDate = new Date(research.uploadDate);
        const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null;
        const toDate = filters.dateTo ? new Date(filters.dateTo) : null;

        if (fromDate && toDate) {
          return uploadDate >= fromDate && uploadDate <= toDate;
        } else if (fromDate) {
          return uploadDate >= fromDate;
        } else if (toDate) {
          return uploadDate <= toDate;
        }
        return true;
      });
    }

    // Course filter
    if (filters.course) {
      results = results.filter(research => 
        research.course?.toLowerCase() === filters.course.toLowerCase()
      );
    }

    // Keywords filter
    if (filters.keywords) {
      results = results.filter(research =>
        research.keywords.toLowerCase().includes(filters.keywords.toLowerCase())
      );
    }

    setFilteredResearches(results);
    setShowFilterModal(false);
  };

  const resetFilters = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      course: '',
      keywords: ''
    });
    setFilteredResearches(researches);
    setShowFilterModal(false);
  };

  return (
    <div className="dashboard-container d-flex">
      <Sidebar />
      <div className="main-section col-10 d-flex flex-column">
        <Header userName={userName} />
        <main className="main-content p-4">
          {/* Search and Filter Bar */}
          <div className="search-filter-container mb-4">
            <div className="d-flex gap-3">
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by title, authors, or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <span className="input-group-text">
                  <i className="fas fa-search"></i>
                </span>
              </div>
              <button 
                className="btn btn-success" 
                onClick={() => setShowFilterModal(true)}
              >
                <i className="fas fa-filter me-2"></i>
                Filters
              </button>
            </div>
          </div>

          {/* Filter Modal */}
          <div className={`modal fade ${showFilterModal ? 'show' : ''}`} 
               style={{ display: showFilterModal ? 'block' : 'none' }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Filter Research Papers</h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setShowFilterModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Date Range</label>
                    <div className="d-flex gap-2">
                      <input
                        type="date"
                        className="form-control"
                        name="dateFrom"
                        value={filters.dateFrom}
                        onChange={handleFilterChange}
                      />
                      <span className="align-self-center">to</span>
                      <input
                        type="date"
                        className="form-control"
                        name="dateTo"
                        value={filters.dateTo}
                        onChange={handleFilterChange}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Course</label>
                    <select 
                      className="form-select"
                      name="course"
                      value={filters.course}
                      onChange={handleFilterChange}
                    >
                      <option value="">All Courses</option>
                      <option value="BS-MATH">BS Mathematics</option>
                      <option value="BS-ES">BS Environmental Science</option>
                      <option value="BSDC">BS Data Science</option>
                      <option value="BSCD">BS Computer Science</option>
                      <option value="BS-BIO">BS Biology</option>
                      <option value="AB-SOCSCI">AB Social Science</option>
                      <option value="AB-SOCIO">AB Sociology</option>
                      <option value="AB-PHILO">AB Philosophy</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Keywords</label>
                    <input
                      type="text"
                      className="form-control"
                      name="keywords"
                      value={filters.keywords}
                      onChange={handleFilterChange}
                      placeholder="Enter keywords..."
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={resetFilters}
                  >
                    Reset
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-success" 
                    onClick={applyFilters}
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="row g-4">
              {filteredResearches.map((research) => (
                <div key={research._id} className="col-12">
                  <div 
                    className="card research-card shadow-sm" 
                    onClick={() => handleCardClick(research._id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="card-body">
                      <div className="row">
                        <div className="col-lg-9">
                          <h5 className="card-title">{research.title}</h5>
                          <div className="meta-info">
                            <p className="card-text text-muted mb-2">
                              <i className="fas fa-users me-2"></i>
                              <span>{research.authors}</span>
                            </p>
                            <p className="card-text text-muted mb-2">
                              <i className="fas fa-graduation-cap me-2"></i>
                              <span>{research.course || research.student?.course}</span>
                            </p>
                            <p className="card-text text-muted mb-2">
                              <i className="fas fa-tags me-2"></i>
                              <span>{research.keywords}</span>
                            </p>
                          </div>
                          <p className="abstract-preview">
                            {research.abstract.substring(0, 150)}...
                          </p>
                        </div>
                        <div className="col-lg-3 d-flex flex-column justify-content-center align-items-end">
                          <div className="text-muted">
                            <i className="fas fa-calendar me-2"></i>
                            <small>
                              {new Date(research.uploadDate).toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Repository;
