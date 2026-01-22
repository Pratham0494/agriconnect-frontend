import React from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Login from './login';
import ChangePass from './forgot_password'; 
// 1. Import the new Reset Confirmation component
import ResetConfirm from './ResetConfirm'; 

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Default page is Login */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          
          {/* Route for the initial Forgot Password request */}
          <Route path="/forgot_password" element={<ChangePass />} />

          {/* 2. New Dynamic Route for setting the new password */}
          {/* The :uid and :token are variables that match the link in your terminal */}
          <Route path="/password-reset-confirm/:uidb64/:token" element={<ResetConfirm />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;