import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './resources/Sidebar';
import Header from './resources/Header';
import { getUserName, getToken } from './resources/Utils';
import DataTable from 'react-data-table-component';
import { FaEye, FaDownload, FaArchive, FaUndo, FaExternalLinkAlt } from 'react-icons/fa';
import { useEditMode } from './resources/EditModeContext';
import LoadingWithNetworkCheck from '../common/LoadingWithNetworkCheck';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Dashboard.css';

const AdminRepository = () => {
  const navigate = useNavigate();
  const [userName] = useState(getUserName());
  const [researches, setResearches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResearch, setSelectedResearch] = useState(null);
  const [activeTab, setActiveTab] = useState('Active');
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [selectedResearchId, setSelectedResearchId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  
  const { 
    isEditMode,
    setIsEditMode, 
    currentEditor, 
    setCurrentEditor,
    socket 
  } = useEditMode();

  useEffect(() => {
    const fetchResearches = async () => {
      try {
        const token = getToken();
        if (!token) {
          navigate('/');
          return;
        }

        const response = await fetch('http://localhost:8000/admin/all-researches', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch researches');
        }

        const data = await response.json();
        setResearches(data);
      } catch (err) {
        console.error('Error:', err);
        showAlert('Failed to fetch researches', 'danger');
      } finally {
        setLoading(false);
      }
    };

    fetchResearches();
  }, [navigate]);

  const showAlert = (message, type) => {
    setAlert({
      show: true,
      message,
      type
    });
    setTimeout(() => setAlert({ show: false, message: '', type: '' }), 5000);
  };

  const toggleEditMode = async () => {
    try {
      const token = getToken();
      const response = await fetch('http://localhost:8000/admin/edit-mode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          isEditing: !isEditMode,
          editor: userName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to toggle edit mode');
      }

      setIsEditMode(!isEditMode);
      socket.emit('editModeChange', {
        isEditing: !isEditMode,
        editor: userName,
      });
    } catch (error) {
      console.error('Error toggling edit mode:', error);
      showAlert('Failed to toggle edit mode', 'danger');
    }
  };

  const handleArchive = async (researchId) => {
    setIsProcessing(true);
    try {
      const token = getToken();
      const response = await fetch(`http://localhost:8000/admin/research/${researchId}/archive`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to archive research');
      }

      setResearches(prev => prev.map(research => 
        research._id === researchId ? { ...research, archived: true } : research
      ));
      showAlert('Research archived successfully', 'success');

      const modal = document.getElementById('archiveModal');
      const bootstrapModal = bootstrap.Modal.getInstance(modal);
      if (bootstrapModal) {
        bootstrapModal.hide();
      }

    } catch (error) {
      console.error('Error archiving research:', error);
      showAlert('Failed to archive research', 'danger');
    } finally {
      setIsProcessing(false);
      setSelectedResearchId(null);
    }
  };

  const handleRestore = async (researchId) => {
    setIsProcessing(true);
    try {
      const token = getToken();
      const response = await fetch(`http://localhost:8000/admin/research/${researchId}/restore`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to restore research');
      }

      const updatedResearch = await response.json();
      setResearches(prev => prev.map(research => 
        research._id === researchId ? { ...research, archived: false } : research
      ));
      showAlert('Research restored successfully', 'success');

      const modal = bootstrap.Modal.getInstance(document.getElementById('restoreModal'));
      if (modal) modal.hide();

    } catch (error) {
      console.error('Error restoring research:', error);
      showAlert('Failed to restore research', 'danger');
    } finally {
      setIsProcessing(false);
      setSelectedResearchId(null);
    }
  };

  const handleViewClick = (research) => {
    setSelectedResearch(research);
    const modal = new bootstrap.Modal(document.getElementById('viewResearchModal'));
    modal.show();
  };

  const columns = {
    active: [
      {
        name: 'Title',
        selector: row => row.title,
        sortable: true,
        grow: 2,
      },
      {
        name: 'Author(s)',
        selector: row => row.authors,
        sortable: true,
        grow: 1,
      },
      {
        name: 'Course',
        selector: row => row.course,
        sortable: true,
      },
      {
        name: 'Upload Date',
        selector: row => row.uploadDate,
        sortable: true,
        cell: row => new Date(row.uploadDate).toLocaleDateString()
      },
      {
        name: 'Actions',
        cell: row => (
          <div className="d-flex gap-2 flex-wrap justify-content-start" style={{ minWidth: '200px' }}>
            <button
              className="btn btn-sm btn-primary d-flex align-items-center"
              onClick={() => handleViewClick(row)}
              style={{ width: '80px' }}
            >
              <FaEye className="me-1" /> View
            </button>
            <button
              className="btn btn-sm btn-danger d-flex align-items-center"
              onClick={() => {
                setSelectedResearchId(row._id);
                const modal = new bootstrap.Modal(document.getElementById('archiveModal'));
                modal.show();
              }}
              style={{ width: '100px' }}
              disabled={!isEditMode || (currentEditor && currentEditor !== userName)}
            >
              <FaArchive className="me-1" /> Archive
            </button>
          </div>
        ),
        width: '250px'
      }
    ],
    archived: [
      {
        name: 'Title',
        selector: row => row.title,
        sortable: true,
        grow: 2,
      },
      {
        name: 'Author(s)',
        selector: row => row.authors,
        sortable: true,
        grow: 1,
      },
      {
        name: 'Course',
        selector: row => row.course,
        sortable: true,
      },
      {
        name: 'Upload Date',
        selector: row => row.uploadDate,
        sortable: true,
        cell: row => new Date(row.uploadDate).toLocaleDateString()
      },
      {
        name: 'Actions',
        cell: row => (
          <div className="d-flex gap-2 flex-wrap justify-content-start" style={{ minWidth: '200px' }}>
            <button
              className="btn btn-sm btn-primary d-flex align-items-center"
              onClick={() => handleViewClick(row)}
              style={{ width: '80px' }}
            >
              <FaEye className="me-1" /> View
            </button>
            <button
              className="btn btn-sm btn-success d-flex align-items-center"
              onClick={() => {
                setSelectedResearchId(row._id);
                const modal = new bootstrap.Modal(document.getElementById('restoreModal'));
                modal.show();
              }}
              style={{ width: '100px' }}
              disabled={!isEditMode || (currentEditor && currentEditor !== userName)}
            >
              <FaUndo className="me-1" /> Restore
            </button>
          </div>
        ),
        width: '250px'
      }
    ]
  };

  const getFilteredData = () => {
    return researches.filter(research => 
      activeTab === 'Active' ? !research.archived : research.archived
    );
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
          <h4 className="my-3">RESEARCH REPOSITORY</h4>

          <div className="d-flex justify-content-between align-items-center mb-3">
            <button 
              className={`btn ${isEditMode ? 'btn-danger' : 'btn-success'}`}
              onClick={toggleEditMode}
              disabled={currentEditor && currentEditor !== userName}
            >
              {isEditMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
            </button>
            
            {currentEditor && currentEditor !== userName && (
              <div className="alert alert-warning mb-0 py-2">
                {currentEditor} is currently editing
              </div>
            )}
          </div>

          {alert.show && (
            <div className={`alert alert-${alert.type} alert-dismissible fade show`} role="alert">
              {alert.message}
              <button type="button" className="btn-close" onClick={() => setAlert({ ...alert, show: false })}></button>
            </div>
          )}

          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'Active' ? 'active' : ''}`}
                onClick={() => setActiveTab('Active')}
              >
                Active
                <span className="badge bg-primary ms-2">
                  {researches.filter(r => !r.archived).length}
                </span>
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'Archived' ? 'active' : ''}`}
                onClick={() => setActiveTab('Archived')}
              >
                Archived
                <span className="badge bg-secondary ms-2">
                  {researches.filter(r => r.archived).length}
                </span>
              </button>
            </li>
          </ul>

          <DataTable
            columns={activeTab === 'Active' ? columns.active : columns.archived}
            data={getFilteredData()}
            pagination
            paginationPerPage={10}
            paginationRowsPerPageOptions={[10, 20, 30, 50]}
            progressPending={loading}
            highlightOnHover
            pointerOnHover
            responsive
            striped
          />

          <div className="modal fade" id="viewResearchModal" tabIndex="-1">
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Research Details</h5>
                  <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div className="modal-body">
                  {selectedResearch && (
                    <div>
                      <h5>{selectedResearch.title}</h5>
                      <div className="row mb-3">
                        <div className="col-md-12">
                          <p><strong>Abstract:</strong></p>
                          <p>{selectedResearch.abstract}</p>
                        </div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <p><strong>Authors:</strong></p>
                          <p>{selectedResearch.authors}</p>
                        </div>
                        <div className="col-md-6">
                          <p><strong>Keywords:</strong></p>
                          <p>{selectedResearch.keywords}</p>
                        </div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <p><strong>Course:</strong> {selectedResearch.course}</p>
                        </div>
                        <div className="col-md-6">
                          <p><strong>Upload Date:</strong></p>
                          <p>{new Date(selectedResearch.uploadDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  {selectedResearch && (
                    <a
                      className="btn btn-success d-flex align-items-center gap-2"
                      href={`https://drive.google.com/file/d/${selectedResearch.driveFileId}/view`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FaExternalLinkAlt /> Open File
                    </a>
                  )}
                  <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
              </div>
            </div>
          </div>

          <div className="modal fade" id="archiveModal" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Confirm Archive</h5>
                  <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div className="modal-body">
                  <p>Are you sure you want to archive this research? It will no longer be visible in the student repository.</p>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    data-bs-dismiss="modal"
                    disabled={isProcessing}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-danger"
                    onClick={() => handleArchive(selectedResearchId)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Archiving...
                      </>
                    ) : (
                      'Archive'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="modal fade" id="restoreModal" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Confirm Restore</h5>
                  <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div className="modal-body">
                  <p>Are you sure you want to restore this research? It will be visible in the student repository.</p>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    data-bs-dismiss="modal"
                    disabled={isProcessing}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-success"
                    onClick={() => handleRestore(selectedResearchId)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Restoring...
                      </>
                    ) : (
                      'Restore'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminRepository;
