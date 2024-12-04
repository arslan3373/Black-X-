// src/App.js
import React from 'react';
import './App.css'; // Import your styles
import { Routes, Route } from 'react-router-dom'; // Import necessary components for routing
import { AdminDashboard } from './components/AdminDashboard'; // Import AdminDashboard
import { Login } from './components/Login'; // Import Login

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<AdminDashboard />} />
      </Routes>
    </>
  );
}

export default App;
