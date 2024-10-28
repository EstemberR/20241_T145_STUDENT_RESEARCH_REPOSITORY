import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from "./Components/login/Login";
import StudentDashboard from './Components/dashboard/student_dashboard'; 
import AdminDashboard from './Components/dashboard/admin_dashboard'; 
import InstructorDashboard from './Components/dashboard/instructor_dashboard'; 

import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {

  const [userRole, setUserRole] = useState(null); 

  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login setUserRole={setUserRole} />} />
          
          <Route path="/admin_dashboard" element={userRole === "admin" ? <AdminDashboard /> : <Navigate to="/login" />} />
          <Route path="/student_dashboard" element={userRole === "student" ? <StudentDashboard /> : <Navigate to="/login" />} />
          <Route path="/instructor_dashboard" element={userRole === "instructor" ? <InstructorDashboard /> : <Navigate to="/login" />} />

        </Routes>
      </Router>
    </div>
  );
}

export default App;
