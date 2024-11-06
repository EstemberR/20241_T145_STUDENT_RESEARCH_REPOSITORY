import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from './components/Login';
import StudentDashboard from './components/Student/Dashboard';
import MyResearch from './components/Student/MyResearch';
import FAQ from './components/Student/FAQ';
import Notification from './components/Student/Notification';
import Repository from './components/Student/ResearchRepository';
import Profile from './components/Student/UserProfile';

import InstructorDashboard from './components/Instructor/instructor_dashboard';


import AdminDashboard from './components/Admin/admin_dashboard';
import AdminAccounts from './components/Admin/admin_accounts';
import AdminActivity from './components/Admin/admin_acitivty';
import AdminRepo from './components/Admin/admin_repositoryTable';
import AdminReports from './components/Admin/admin_reports';
import AdminRequest from './components/Admin/admin_request';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        {/* STUDENT */}
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/repository" element={<Repository />} />
          <Route path="/student/profile" element={<Profile />} />
          <Route path="/student/myResearch" element={<MyResearch />} />
          <Route path="/student/FAQ" element={<FAQ />} />
          <Route path="/student/notifications" element={<Notification />} />
        {/* INSTRUCTOR */}
          <Route path="/instructor/dashboard" element={<InstructorDashboard />} />
          {/*ADMIN*/}
          <Route path="/admin/admin_dashboard" element={<AdminDashboard />} />
          <Route path="/admin/accounts" element={<AdminAccounts />} />
          <Route path="/admin/activity" element={<AdminActivity />} />
          <Route path="/admin/repositoryTable" element={<AdminRepo />} />
          <Route path="/admin/report" element={<AdminReports />} />
          <Route path="/admin/request" element={<AdminRequest />} />

      </Routes>
    </Router>
  );
}

export default App;
