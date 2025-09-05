import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MigrationProvider } from './context/MigrationContext';
import Home from './pages/Home/Home';
import MigrationDetailPage from './pages/MigrationDetail/MigrationDetailPage';
import './App.css';
import Login from './pages/Login/Login';

const App: React.FC = () => {
  return (
    
    <MigrationProvider> 
      <Router>
        <div className="app">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/home" element={<Home />} />
            <Route path="/migration/:id" element={<MigrationDetailPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </MigrationProvider>
   
  );
};

export default App;
