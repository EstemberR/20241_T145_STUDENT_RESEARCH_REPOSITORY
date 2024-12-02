import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './resources/Sidebar';
import Header from './resources/Header';
import { getUserName, getToken } from './resources/Utils';
import { FaDownload, FaChartBar, FaCalendar, FaUsers, FaBookmark } from 'react-icons/fa';
import DataTable from 'react-data-table-component';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Dashboard.css';
import '../css/admin_dashboard.css';

const SuperAdminReports = () => {
  const navigate = useNavigate();
  const [userName] = useState(getUserName());
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startYear: new Date().getFullYear().toString(),
    endYear: new Date().getFullYear().toString()
  });
  const [selectedCourse, setSelectedCourse] = useState('');
  const [courses, setCourses] = useState([]);
  const [researchData, setResearchData] = useState([]);
  const [reportType, setReportType] = useState('submissions');

  const reportTypes = [
    {
      id: 'submissions',
      title: 'Research Submissions Report',
      description: 'Generate a report of all research submissions within a date range',
      icon: <FaBookmark className="fs-1 text-primary" />
    },
    {
      id: 'status',
      title: 'Status Distribution Report',
      description: 'View the distribution of research statuses (Accepted, Pending, Revision)',
      icon: <FaChartBar className="fs-1 text-success" />
    },
    {
      id: 'course',
      title: 'Course-wise Research Report',
      description: 'Analyze research submissions by course and department',
      icon: <FaUsers className="fs-1 text-info" />
    }
  ];

  useEffect(() => {
    const token = getToken();
    if (!token) {
      alert('Please log in first.');
      localStorage.removeItem('userName');
      localStorage.removeItem('token');
      navigate('/');
    } else {
      fetchInitialData();
    }
  }, [navigate]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      // Fetch courses
      const coursesResponse = await fetch('http://localhost:8000/admin/courses', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const coursesData = await coursesResponse.json();
      setCourses(coursesData);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching initial data:', error);
      setLoading(false);
    }
  };

  const generateReport = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      const params = new URLSearchParams({
        startDate: `${dateRange.startYear}-01-01`,
        endDate: `${dateRange.endYear}-12-31`,
        course: selectedCourse,
        type: reportType
      });

      const response = await fetch(`http://localhost:8000/admin/generate-report?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      setResearchData(data);
      setLoading(false);
    } catch (error) {
      console.error('Error generating report:', error);
      setLoading(false);
    }
  };

  const downloadReport = async (format) => {
    try {
      const token = getToken();
      const params = new URLSearchParams({
        startDate: `${dateRange.startYear}-01-01`,
        endDate: `${dateRange.endYear}-12-31`,
        course: selectedCourse,
        type: reportType,
        format: format
      });

      const response = await fetch(`http://localhost:8000/admin/download-report?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `research-report-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading report:', error);
    }
  };

  const columns = [
    {
      name: 'Title',
      selector: row => row.title,
      sortable: true,
    },
    {
      name: 'Authors',
      selector: row => row.authors,
      sortable: true,
    },
    {
      name: 'Course',
      selector: row => row.course,
      sortable: true,
    },
    {
      name: 'Status',
      selector: row => row.status,
      sortable: true,
    },
    {
      name: 'Submission Date',
      selector: row => new Date(row.uploadDate).toLocaleDateString(),
      sortable: true,
    }
  ];

  const years = Array.from({ length: new Date().getFullYear() - 2019 }, (_, i) => (2020 + i).toString());

  return (
    <div className="dashboard-container d-flex">
      <Sidebar />
      <div className="main-section col-10 d-flex flex-column">
        <Header userName={userName} />
        <main className="main-content p-4">
          <h4 className="mb-4">REPORT GENERATION</h4>

          {/* Report Type Selection */}
          <div className="row mb-4">
            {reportTypes.map(type => (
              <div key={type.id} className="col-md-4 mb-3">
                <div 
                  className={`card h-100 cursor-pointer ${reportType === type.id ? 'border-primary' : ''}`}
                  onClick={() => setReportType(type.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="card-body text-center">
                    {type.icon}
                    <h5 className="card-title mt-3">{type.title}</h5>
                    <p className="card-text text-muted">{type.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="card mb-4">
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">Start Year</label>
                  <select
                    className="form-select"
                    value={dateRange.startYear}
                    onChange={(e) => setDateRange(prev => ({ ...prev, startYear: e.target.value }))}
                  >
                    {years.map(year => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">End Year</label>
                  <select
                    className="form-select"
                    value={dateRange.endYear}
                    onChange={(e) => setDateRange(prev => ({ ...prev, endYear: e.target.value }))}
                  >
                    {years.map(year => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Course</label>
                  <select 
                    className="form-select"
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                  >
                    <option value="">All Courses</option>
                    {courses.map(course => (
                      <option key={course._id} value={course._id}>
                        {course.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-3">
                <button 
                  className="btn btn-primary me-2"
                  onClick={generateReport}
                  disabled={loading}
                >
                  <FaChartBar className="me-2" />
                  Generate Report
                </button>
                <button 
                  className="btn btn-success me-2"
                  onClick={() => downloadReport('xlsx')}
                  disabled={loading || !researchData.length}
                >
                  <FaDownload className="me-2" />
                  Download Excel
                </button>
                <button 
                  className="btn btn-danger"
                  onClick={() => downloadReport('pdf')}
                  disabled={loading || !researchData.length}
                >
                  <FaDownload className="me-2" />
                  Download PDF
                </button>
              </div>
            </div>
          </div>

          {/* Results Table */}
          {loading ? (
            <div className="text-center my-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : researchData.length > 0 ? (
            <div className="card">
              <div className="card-body">
                <DataTable
                  columns={columns}
                  data={researchData}
                  pagination
                  responsive
                  highlightOnHover
                  striped
                />
              </div>
            </div>
          ) : (
            <div className="text-center my-5 text-muted">
              <FaCalendar className="fs-1 mb-3" />
              <h5>Select filters and generate a report to view data</h5>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SuperAdminReports;
