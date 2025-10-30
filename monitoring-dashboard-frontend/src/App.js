import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Activity, Database, Server } from 'lucide-react';
import './App.css';
import Dashboard from './pages/Dashboard';
import LogsPage from './pages/LogsPage';

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="nav-brand">
            <Activity className="nav-icon" />
            <span>Monitoring PI-Gateway & PI-Connector</span>
          </div>
          <div className="nav-links">
            <Link to="/" className="nav-link">
              <Server size={18} />
              <span>Dashboard Temps Réel</span>
            </Link>
            <Link to="/logs" className="nav-link">
              <Database size={18} />
              <span>Tous les Logs</span>
            </Link>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/logs" element={<LogsPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
