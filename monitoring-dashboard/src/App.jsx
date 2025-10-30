import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Overview from './pages/Overview';
import PiGatewayDetails from './pages/PiGatewayDetails';
import PiConnectorDetails from './pages/PiConnectorDetails';
import LogsExplorer from './pages/LogsExplorer';
import ProcessingTracer from './pages/ProcessingTracer';
import Analytics from './pages/Analytics';

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/pi-gateway" element={<PiGatewayDetails />} />
            <Route path="/pi-connector" element={<PiConnectorDetails />} />
            <Route path="/logs" element={<LogsExplorer />} />
            <Route path="/processing" element={<ProcessingTracer />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
