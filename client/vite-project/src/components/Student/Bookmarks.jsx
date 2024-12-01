import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './resources/Sidebar';
import Header from './resources/Header';
import { getUserName, getToken } from './resources/Utils';
import DataTable from 'react-data-table-component';
import { FaSearch, FaExternalLinkAlt, FaBookmark } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Dashboard.css';

const Bookmarks = () => {
  const navigate = useNavigate();
  const [userName] = useState(getUserName());
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState('');

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
      name: 'Actions',
      cell: row => (
        <div className="d-flex gap-2">
          <button
            className="btn btn-sm btn-success"
            onClick={() => handleCardClick(row._id)}
            title="View Research"
          >
            <FaExternalLinkAlt />
          </button>
          <button
            className="btn btn-sm btn-outline-success"
            onClick={() => handleRemoveBookmark(row._id)}
            title="Remove Bookmark"
          >
            <FaBookmark />
          </button>
        </div>
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
    const fetchBookmarks = async () => {
      try {
        const token = getToken();
        if (!token) {
          navigate('/');
          return;
        }

        const response = await fetch('http://localhost:8000/student/bookmarks', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error('Failed to fetch bookmarks');
        
        const data = await response.json();
        setBookmarks(data.bookmarks || []);
        setLoading(false);
      } catch (error) {
        console.error('Error:', error);
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, [navigate]);

  const handleCardClick = (researchId) => {
    window.open(`/repository/${researchId}`, '_blank');
  };

  const handleRemoveBookmark = async (researchId) => {
    try {
      const token = getToken();
      const response = await fetch(`http://localhost:8000/student/bookmark/${researchId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setBookmarks(prev => prev.filter(bookmark => bookmark._id !== researchId));
      }
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  };

  const filteredItems = bookmarks.filter(
    item => {
      const searchText = filterText.toLowerCase();
      return (
        item.title.toLowerCase().includes(searchText) ||
        item.authors.toLowerCase().includes(searchText) ||
        (item.course || item.student?.course || '').toLowerCase().includes(searchText)
      );
    }
  );

  return (
    <div className="dashboard-container d-flex">
      <Sidebar />
      <div className="main-section col-10 d-flex flex-column">
        <Header userName={userName} />
        <main className="main-content p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4>MY BOOKMARKS</h4>
            <div className="search-container" style={{ width: '300px' }}>
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
          </div>

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

export default Bookmarks;
