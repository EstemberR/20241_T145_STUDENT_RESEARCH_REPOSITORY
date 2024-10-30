import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import MyResearch from './components/MyResearch';
import FAQ from './components/FAQ';
import Notification from './components/Notification';
import Repository from './components/ResearchRepository';
import Profile from './components/UserProfile';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />

        {/* Redirect to Dashboard when accessing the root path */}
        <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/repository" element={<Repository />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/myResearch" element={<MyResearch />} />
          <Route path="/FAQ" element={<FAQ />} />
          <Route path="/notifications" element={<Notification />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
