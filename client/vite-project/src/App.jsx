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
import InstructorNotification from './components/Instructor/instructor_notification';
import InstructorProfile from './components/Instructor/instructor_profile';
import InstructorRequest from './components/Instructor/instructor_request';
import InstructorStudents from './components/Instructor/instructor_students';
import InstructorSubmissions from './components/Instructor/instructor_submissions';
import AdviserResearches from './components/Instructor/adviser_researches';
import AdminDashboard from './components/Admin/admin_dashboard';
import AdminAccounts from './components/Admin/admin_accounts';
import AdminActivity from './components/Admin/admin_acitivty';
import AdminRepo from './components/Admin/admin_repositoryTable';
import AdminReports from './components/Admin/admin_reports';
import AdminRequest from './components/Admin/admin_request';
import ProtectedRoute from './components/ProtectedRoute';


{/*LANDING PAGE*/ }
import LandingPage from './components/landingPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        {/* Student Protected Routes */}
        <Route element={<ProtectedRoute allowedRole="student" />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/repository" element={<Repository />} />
          <Route path="/student/profile" element={<Profile />} />
          <Route path="/student/myResearch" element={<MyResearch />} />
          <Route path="/student/FAQ" element={<FAQ />} />
          <Route path="/student/notifications" element={<Notification />} />
          <Route path="/student/logout" element={<Navigate to="/" replace />} />
        </Route>

        {/* Instructor Protected Routes */}
        <Route element={<ProtectedRoute allowedRole="instructor" />}>
          <Route path="/instructor/instructor_dashboard" element={<InstructorDashboard />} />
          <Route path="/instructor/submissions" element={<InstructorSubmissions />} />
          <Route path="/instructor/profile" element={<InstructorProfile />} />
          <Route path="/instructor/students" element={<InstructorStudents />} />
          <Route path="/instructor/requesting" element={<InstructorRequest />} />
          <Route path="/instructor/notifications" element={<InstructorNotification />} />
          <Route path="/instructor/adviser-researches" element={<AdviserResearches />} />
          <Route path="/instructor/logout" element={<Navigate to="/" replace />} />
        </Route>

          {/* Admin Protected Routes */}
        <Route element={<ProtectedRoute allowedRole="admin" />}>
          <Route path="/admin/admin_dashboard" element={<AdminDashboard />} />
          <Route path="/admin/accounts" element={<AdminAccounts />} />
          <Route path="/admin/activity" element={<AdminActivity />} />
          <Route path="/admin/repositoryTable" element={<AdminRepo />} />
          <Route path="/admin/report" element={<AdminReports />} />
          <Route path="/admin/request" element={<AdminRequest />} />
          <Route path="/admin/logout" element={<Navigate to="/" replace />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;