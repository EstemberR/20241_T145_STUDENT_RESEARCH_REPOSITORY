import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from './components/Login';
import StudentDashboard from './components/Dashboard';
import MyResearch from './components/MyResearch';
import FAQ from './components/FAQ';
import Notification from './components/Notification';
import Repository from './components/ResearchRepository';
import Profile from './components/UserProfile';
import AdminDashboard from './components/admin_dashboard';
import InstructorDashboard from './components/instructor_dashboard';

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
          <Route path="/admin/admin-dashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
