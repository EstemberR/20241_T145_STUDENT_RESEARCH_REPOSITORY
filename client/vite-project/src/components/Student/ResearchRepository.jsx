import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './resources/Sidebar';
import Header from './resources/Header';
import { getUserName, getToken } from './resources/Utils';
import DataTable from 'react-data-table-component';
import { FaSearch, FaExternalLinkAlt, FaFilter, FaBookmark, FaRegBookmark } from 'react-icons/fa';
import { Modal, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Dashboard.css';
import '../css/ResearchRepository.css';
import LoadingWithNetworkCheck from '../common/LoadingWithNetworkCheck';

const Repository = () => {
  const navigate = useNavigate();
  const [userName] = useState(getUserName());
  const [researches, setResearches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    yearFrom: '',
    yearTo: '',
    course: '',
    keywords: ''
  });
  const [bookmarkedResearch, setBookmarkedResearch] = useState(new Set());
  const [alert, setAlert] = useState({
    show: false,
    message: '',
    variant: 'success'
  });

  const columns = [
    {
      name: 'Title',
      selector: row => row.title,
      sortable: true,
      cell: row => (
        <div>
          <div className="fw-bold">{row.title}</div>
        </div>
      ),
      grow: 2,
    },
    {
      name: 'Authors',
      selector: row => row.authors,
      sortable: true,
      wrap: true
    },
    {
      name: 'Course',
      selector: row => row.course || row.student?.course,
      sortable: true,
    },
    {
      name: 'Keywords',
      selector: row => row.keywords,
      sortable: true,
      wrap: true
    },
    {
      name: 'Upload Date',
      selector: row => row.uploadDate,
      sortable: true,
      cell: row => new Date(row.uploadDate).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    },
    {
      name: 'Bookmark',
      cell: row => (
        <button
          className="btn btn-link"
          onClick={(e) => {
            e.stopPropagation();
            handleBookmark(row._id);
          }}
          title={bookmarkedResearch.has(row._id) ? "Remove Bookmark" : "Add Bookmark"}
        >
          {bookmarkedResearch.has(row._id) ? (
            <FaBookmark className="text-success" />
          ) : (
            <FaRegBookmark className="text-success" />
          )}
        </button>
      ),
      width: '100px',
      center: true,
    },
    {
      name: 'Actions',
      cell: row => (
        <button
          className="btn btn-sm btn-success"
          onClick={() => handleCardClick(row._id)}
          title="View Research"
        >
          <FaExternalLinkAlt />
        </button>
      ),
      button: true,
    }
  ];

  const customStyles = {
    rows: {
      style: {
        minHeight: '72px',
      }
    },
    headCells: {
      style: {
        paddingLeft: '8px',
        paddingRight: '8px',
        backgroundColor: '#f8f9fa',
        fontWeight: 'bold'
      },
    },
    cells: {
      style: {
        paddingLeft: '8px',
        paddingRight: '8px',
      },
    },
  };

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
        const acceptedResearches = data.filter(research => research.status === 'Accepted');
        setResearches(acceptedResearches);
        setLoading(false);
      } catch (error) {
        console.error('Error:', error);
        setLoading(false);
      }
    };

    fetchResearches();
  }, [navigate]);

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const token = getToken();
        const response = await fetch('http://localhost:8000/student/bookmarks', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          const bookmarkedIds = new Set(data.bookmarks.map(bookmark => bookmark._id));
          setBookmarkedResearch(bookmarkedIds);
        }
      } catch (error) {
        console.error('Error fetching bookmarks:', error);
      }
    };

    fetchBookmarks();
  }, []);

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
    let results = researches;

    // Year range filter
    if (filters.yearFrom || filters.yearTo) {
      results = results.filter(research => {
        const uploadYear = new Date(research.uploadDate).getFullYear();
        const fromYear = filters.yearFrom ? parseInt(filters.yearFrom) : null;
        const toYear = filters.yearTo ? parseInt(filters.yearTo) : null;

        if (fromYear && toYear) {
          return uploadYear >= fromYear && uploadYear <= toYear;
        } else if (fromYear) {
          return uploadYear >= fromYear;
        } else if (toYear) {
          return uploadYear <= toYear;
        }
        return true;
      });
    }

    // Course filter
    if (filters.course) {
      results = results.filter(research => 
        (research.course || research.student?.course)?.toLowerCase() === filters.course.toLowerCase()
      );
    }

    // Keywords filter
    if (filters.keywords) {
      results = results.filter(research =>
        research.keywords.toLowerCase().includes(filters.keywords.toLowerCase())
      );
    }

    setFilteredItems(results);
    setShowFilterModal(false);
  };

  const resetFilters = () => {
    setFilters({
      yearFrom: '',
      yearTo: '',
      course: '',
      keywords: ''
    });
    setFilteredItems(researches);
    setShowFilterModal(false);
  };

  const [filteredItems, setFilteredItems] = useState([]);

  useEffect(() => {
    const results = researches.filter(
      item => {
        const searchText = filterText.toLowerCase();
        return (
          item.title.toLowerCase().includes(searchText) ||
          item.authors.toLowerCase().includes(searchText) ||
          item.keywords.toLowerCase().includes(searchText) ||
          (item.course || item.student?.course || '').toLowerCase().includes(searchText)
        );
      }
    );
    setFilteredItems(results);
  }, [filterText, researches]);

  const showAlert = (message, variant = 'success') => {
    setAlert({
      show: true,
      message,
      variant
    });

    setTimeout(() => {
      setAlert(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  const handleBookmark = async (researchId) => {
    try {
      const token = getToken();
      const response = await fetch(`http://localhost:8000/student/bookmark/${researchId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBookmarkedResearch(prev => {
          const newBookmarks = new Set(prev);
          if (data.isBookmarked) {
            newBookmarks.add(researchId);
            showAlert('Research added to bookmarks');
          } else {
            newBookmarks.delete(researchId);
            showAlert('Research removed from bookmarks');
          }
          return newBookmarks;
        });
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      showAlert('Failed to update bookmark', 'danger');
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container d-flex">
        <Sidebar />
        <div className="main-section col-10 d-flex flex-column">
          <Header userName={userName} />
          <LoadingWithNetworkCheck />
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
          <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 1050 }}>
            <Alert 
              show={alert.show} 
              variant={alert.variant}
              onClose={() => setAlert(prev => ({ ...prev, show: false }))}
              dismissible
            >
              {alert.message}
            </Alert>
          </div>
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4>RESEARCH REPOSITORY</h4>
              <div className="d-flex gap-2">
                <div className="search-container">
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search..."
                      value={filterText}
                      onChange={e => setFilterText(e.target.value)}
                    />
                    <span className="input-group-text">
                      <FaSearch />
                    </span>
                  </div>
                </div>
                <button 
                  className="btn btn-success" 
                  onClick={() => setShowFilterModal(true)}
                >
                  <FaFilter className="me-2" />
                  Filters
                </button>
              </div>
            </div>
          </div>

          {/* Filter Modal */}
          <Modal show={showFilterModal} onHide={() => setShowFilterModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Filter Research Papers</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="mb-3">
                <label className="form-label">Year Range</label>
                <div className="d-flex gap-2">
                  <select
                    className="form-select"
                    name="yearFrom"
                    value={filters.yearFrom}
                    onChange={handleFilterChange}
                  >
                    <option value="">From Year</option>
                    {Array.from({ length: 25 }, (_, i) => new Date().getFullYear() - i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                  <span className="align-self-center">to</span>
                  <select
                    className="form-select"
                    name="yearTo"
                    value={filters.yearTo}
                    onChange={handleFilterChange}
                  >
                    <option value="">To Year</option>
                    {Array.from({ length: 25 }, (_, i) => new Date().getFullYear() - i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
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
            </Modal.Body>
            <Modal.Footer>
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
            </Modal.Footer>
          </Modal>

          <DataTable
            columns={columns}
            data={filteredItems}
            pagination
            paginationPerPage={10}
            paginationRowsPerPageOptions={[10, 20, 30, 50]}
            progressPending={loading}
            customStyles={customStyles}
            highlightOnHover
            pointerOnHover
            responsive
            striped
          />
        </main>
      </div>
    </div>
  );
};

export default Repository;
