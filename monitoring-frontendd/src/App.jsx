import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Dashboard } from './pages/Dashboard';
import { LogsExplorer } from './pages/LogsExplorer';
import { GatewayDetails, ConnectorDetailsPage } from './pages/ConnectorDetails';
import { Analytics } from './pages/Analytics';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-900">
        <Navigation />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/logs" element={<LogsExplorer />} />
          <Route path="/gateway" element={<GatewayDetails />} />
          <Route path="/connector" element={<ConnectorDetailsPage />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
